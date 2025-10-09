import { useCallback, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  IndexTable,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  Badge,
  useBreakpoints,
  TabProps,
  IndexFiltersProps,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const [itemStrings, setItemStrings] = useState(["All", "Active", "Inactive"]);

  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions: [],
  }));
  const [selected, setSelected] = useState(0);
  const onCreateNewView = async (value: string) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };
  const sortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "Campaign name", value: "order asc", directionLabel: "Ascending" },
    {
      label: "Campaign name",
      value: "order desc",
      directionLabel: "Descending",
    },
  ];
  const [sortSelected, setSortSelected] = useState(["order asc"]);
  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => {};

  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };

  const primaryAction: IndexFiltersProps["primaryAction"] =
    selected === 0
      ? {
          type: "save-as",
          onAction: onCreateNewView,
          disabled: false,
          loading: false,
        }
      : {
          type: "save",
          onAction: onHandleSave,
          disabled: false,
          loading: false,
        };
  const [queryValue, setQueryValue] = useState("");

  const campaigns = [
    {
      id: "12314",
      name: (
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          First campaign
        </Text>
      ),
      products: "10 products",
      dateStart: "Oct 20 at 4:34pm",
      dateEnd: "Jul 20 at 4:34pm",
      status: <Badge progress="complete">Enabled</Badge>,
    },
  ];
  const resourceName = {
    singular: "campaign",
    plural: "campaigns",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(campaigns);

  const rowMarkup = campaigns.map(
    ({ id, name, products, dateStart, dateEnd, status }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{products}</IndexTable.Cell>
        <IndexTable.Cell>{dateStart}</IndexTable.Cell>
        <IndexTable.Cell>{dateEnd}</IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page
      title="Campaigns"
      primaryAction={{
        content: "Add campaign",
        onAction: () => {},
      }}
      fullWidth={true}
    >
      <IndexFilters
        sortOptions={sortOptions}
        sortSelected={sortSelected}
        queryValue={queryValue}
        queryPlaceholder="Searching in all"
        onQueryChange={() => setQueryValue("")}
        onQueryClear={() => setQueryValue("")}
        onSort={setSortSelected}
        primaryAction={primaryAction}
        cancelAction={{
          onAction: onHandleCancel,
          disabled: false,
          loading: false,
        }}
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        canCreateNewView={false}
        filters={[]}
        mode={mode}
        setMode={setMode}
        onClearAll={() => setQueryValue("")}
      />
      <IndexTable
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={campaigns.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Campaign name" },
          { title: "Products" },
          { title: "Date start" },
          { title: "Date end" },
          { title: "Status" },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </Page>
  );
}
