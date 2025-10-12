# Checkout Extension Example

## Using Campaign Banners in Shopify Checkout Extensions

This guide shows how to integrate the checkout banner API with a Shopify Checkout UI Extension.

## Prerequisites

1. Backend server running on `http://localhost:3001` (or your production URL)
2. Shopify Checkout UI Extension created
3. Active campaign with products and checkout banner configured

## Extension Code Example

### Basic Implementation

```typescript
import {
  reactExtension,
  Banner,
  useCartLines,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <CampaignBanner />,
);

function CampaignBanner() {
  const lines = useCartLines();
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanner() {
      try {
        // Extract product IDs from cart lines
        const productIds = lines.map(line => {
          const productId = line.merchandise.product.id;
          // Extract numeric ID from GID
          return productId.split('/').pop() || '';
        }).filter(id => id);

        if (productIds.length === 0) {
          setBanner(null);
          setLoading(false);
          return;
        }

        // Fetch banner from backend
        const response = await fetch(
          'http://localhost:3001/api/campaigns/checkout-banner',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setBanner(data.banner);
        }
      } catch (error) {
        console.error('Failed to fetch campaign banner:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBanner();
  }, [lines]);

  if (loading || !banner) {
    return null;
  }

  return (
    <Banner status="info">
      {banner}
    </Banner>
  );
}
```

### Advanced Implementation with Campaign Info

```typescript
import {
  reactExtension,
  Banner,
  useCartLines,
  Text,
  BlockStack,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

interface CampaignBannerData {
  banner: string | null;
  campaignId?: string;
  campaignName?: string;
  priority?: number;
}

export default reactExtension(
  'purchase.checkout.block.render',
  () => <CampaignBanner />,
);

function CampaignBanner() {
  const lines = useCartLines();
  const [campaignData, setCampaignData] = useState<CampaignBannerData | null>(null);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const productIds = lines
          .map(line => line.merchandise.product.id.split('/').pop() || '')
          .filter(id => id);

        if (productIds.length === 0) return;

        const response = await fetch(
          'http://localhost:3001/api/campaigns/checkout-banner',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCampaignData(data);
        }
      } catch (error) {
        console.error('Failed to fetch campaign banner:', error);
      }
    }

    fetchBanner();
  }, [lines]);

  if (!campaignData?.banner) {
    return null;
  }

  return (
    <BlockStack spacing="tight">
      <Banner status="success">
        {campaignData.banner}
      </Banner>
      {campaignData.campaignName && (
        <Text size="small" appearance="subdued">
          Campaign: {campaignData.campaignName}
        </Text>
      )}
    </BlockStack>
  );
}
```

## Environment Configuration

### Development

Update your checkout extension to point to local backend:

```javascript
const BACKEND_URL = "http://localhost:3001/api";
```

### Production

Use environment variables:

```javascript
const BACKEND_URL = process.env.BACKEND_URL || "https://your-backend.com/api";
```

## Testing

### 1. Create Test Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Checkout Banner",
    "checkoutBanner": "🎉 Special offer on your cart items!",
    "status": "active",
    "priority": 10,
    "startDate": "2025-10-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "products": "[{\"id\":\"gid://shopify/Product/YOUR_PRODUCT_ID\",\"title\":\"Test Product\"}]"
  }'
```

### 2. Test the Endpoint

```bash
curl -X POST http://localhost:3001/api/campaigns/checkout-banner \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": ["YOUR_PRODUCT_ID"]
  }'
```

### 3. Expected Response

```json
{
  "banner": "🎉 Special offer on your cart items!",
  "campaignId": "...",
  "campaignName": "Test Checkout Banner",
  "priority": 10
}
```

## Shopify Extension Setup

### 1. Create Extension

```bash
npm run shopify app generate extension
# Select: Checkout UI
# Name: campaign-banner
```

### 2. Extension Configuration

File: `extensions/campaign-banner/shopify.extension.toml`

```toml
api_version = "2024-10"

[[extensions]]
type = "ui_extension"
name = "campaign-banner"
handle = "campaign-banner"

[[extensions.targeting]]
target = "purchase.checkout.block.render"
```

### 3. Deploy Extension

```bash
npm run deploy
```

## CORS Configuration

Ensure your backend allows requests from Shopify checkout:

```typescript
// backend/server.ts
await fastify.register(cors, {
  origin: [
    "https://checkout.shopify.com",
    "https://*.myshopify.com",
    "http://localhost:*", // Development
  ],
  credentials: true,
});
```

## Troubleshooting

### Banner Not Showing

1. Check campaign is active: `status: "active"`
2. Verify dates are current
3. Confirm product IDs match
4. Check backend logs for errors

### CORS Errors

Update CORS settings in `backend/server.ts` to allow Shopify domains.

### Network Errors

- Ensure backend is accessible from checkout
- Check firewall/network settings
- Verify API URL is correct

## Multiple Campaigns

If multiple campaigns match, the **highest priority** campaign wins:

```typescript
// Campaign A: priority 10
// Campaign B: priority 5
// Campaign C: priority 1

→ Returns Campaign A's banner
```

## Best Practices

1. **Cache the response** - Don't fetch on every render
2. **Handle errors gracefully** - Don't break checkout if API fails
3. **Show loading state** - Provide good UX during fetch
4. **Use meaningful banners** - Clear, concise promotional text
5. **Set appropriate priorities** - Important campaigns get higher priority
6. **Test thoroughly** - Verify with different product combinations
