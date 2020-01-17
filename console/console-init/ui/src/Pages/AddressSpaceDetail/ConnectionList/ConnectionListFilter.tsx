/*
 * Copyright 2020, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */

import * as React from "react";
import {
  DataToolbarChip,
  DataToolbarGroup,
  DataToolbarFilter,
  DataToolbarItem,
  DataToolbarToggleGroup,
  DataToolbar,
  DataToolbarContent
} from "@patternfly/react-core/dist/js/experimental";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  InputGroup,
  Button,
  ButtonVariant,
  Badge,
  SelectOption,
  SelectOptionObject,
  Select,
  SelectVariant
} from "@patternfly/react-core";
import { FilterIcon, SearchIcon } from "@patternfly/react-icons";
import useWindowDimensions from "src/Components/Common/WindowDimension";
import { ISortBy } from "@patternfly/react-table";
import { SortForMobileView } from "src/Components/Common/SortForMobileView";
import { useApolloClient } from "@apollo/react-hooks";
import { RETURN_ALL_CONNECTIONS_HOSTNAME_AND_CONTAINERID_OF_ADDRESS_SPACES_FOR_TYPEAHEAD_SEARCH } from "src/Queries/Queries";
import { IConnectionListNameSearchResponse } from "src/Types/ResponseTypes";

interface IConnectionListFilterProps {
  filterValue?: string | null;
  setFilterValue: (value: string) => void;
  hostnames?: Array<string>;
  setHostnames: (value: Array<string>) => void;
  containerIds?: Array<string>;
  setContainerIds: (value: Array<string>) => void;
  sortValue?: ISortBy;
  setSortValue: (value: ISortBy) => void;
  totalConnections: number;
  addressSpaceName?: string;
  namespace?: string;
}
export const ConnectionListFilter: React.FunctionComponent<IConnectionListFilterProps> = ({
  filterValue,
  setFilterValue,
  hostnames,
  setHostnames,
  containerIds,
  setContainerIds,
  totalConnections,
  sortValue,
  setSortValue,
  addressSpaceName,
  namespace
}) => {
  const { width } = useWindowDimensions();
  const client = useApolloClient();
  const [filterIsExpanded, setFilterIsExpanded] = React.useState(false);
  const onFilterSelect = (event: any) => {
    setFilterValue(event.target.value);
    setFilterIsExpanded(!filterIsExpanded);
  };
  const [
    isSelectHostnameExpanded,
    setIsSelectHostnameExpanded
  ] = React.useState<boolean>(false);
  const [
    isSelectContainerExpanded,
    setIsSelectContainerExpanded
  ] = React.useState<boolean>(false);
  const [hostnameSelected, setHostnameSelected] = React.useState<string>();
  const [containerSelected, setContainerSelected] = React.useState<string>();
  const [hostnameOptions, setHostnameOptions] = React.useState<Array<string>>();
  const [containerOptions, setContainerOptions] = React.useState<
    Array<string>
  >();

  const filterMenuItems = [
    { key: "filterHostName", value: "Hostname" },
    { key: "filterContainer", value: "Container" }
  ];

  const sortMenuItems = [
    { key: "hostname", value: "Hostname", index: 0 },
    { key: "containerId", value: "Container ID", index: 1 },
    { key: "protocol", value: "Protocol", index: 2 },
    { key: "messageIn", value: "Messages In", index: 3 },
    { key: "messageOut", value: "Messages Out", index: 4 },
    { key: "sender", value: "Senders", index: 5 },
    { key: "receiver", value: "Receivers", index: 6 }
  ];

  const onClickSearchIcon = (event: any) => {
    if (filterValue)
      if (filterValue === "Container") {
        if (
          containerSelected &&
          containerSelected.trim() !== "" &&
          containerIds
        ) {
          if (containerIds.indexOf(containerSelected.trim()) < 0) {
            setContainerIds([...containerIds, containerSelected.trim()]);
          }
          setContainerSelected(undefined);
        }
      } else if (filterValue === "Hostname") {
        if (hostnameSelected && hostnameSelected.trim() !== "" && hostnames) {
          if (hostnames.indexOf(hostnameSelected) < 0) {
            setHostnames([...hostnames, hostnameSelected]);
          }
          setHostnameSelected(undefined);
        }
      }
  };

  const onHostnameSelectToggle = () => {
    setIsSelectHostnameExpanded(!isSelectHostnameExpanded);
  };

  const onContainerSelectToggle = () => {
    setIsSelectContainerExpanded(!isSelectContainerExpanded);
  };

  const onChangeHostnameData = async (value: string) => {
    setHostnameOptions(undefined);
    if (value.trim().length < 6) {
      setHostnameOptions([]);
      return;
    }
    const response = await client.query<IConnectionListNameSearchResponse>({
      query: RETURN_ALL_CONNECTIONS_HOSTNAME_AND_CONTAINERID_OF_ADDRESS_SPACES_FOR_TYPEAHEAD_SEARCH(
        true,
        value.trim(),
        addressSpaceName,
        namespace
      )
    });
    if (
      response &&
      response.data &&
      response.data.connections &&
      response.data.connections.Connections &&
      response.data.connections.Connections.length > 0
    ) {
      //To display dropdown if fetched records are less than 100 in count.
      if (response.data.connections.Total > 100) {
        setHostnameOptions([]);
      } else {
        const obtainedList = response.data.connections.Connections.map(
          (connection: any) => {
            return connection.Spec.Hostname;
          }
        );
        setHostnameOptions(obtainedList);
      }
    }
  };

  const onHostnameSelectFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChangeHostnameData(e.target.value);
    const options: React.ReactElement[] = hostnameOptions
      ? hostnameOptions.map((option, index) => (
          <SelectOption key={index} value={option} />
        ))
      : [];
    return options;
  };

  const onChangeContainerData = async (value: string) => {
    setContainerOptions(undefined);
    if (value.trim().length < 6) {
      setContainerOptions([]);
      return;
    }
    const response = await client.query<IConnectionListNameSearchResponse>({
      query: RETURN_ALL_CONNECTIONS_HOSTNAME_AND_CONTAINERID_OF_ADDRESS_SPACES_FOR_TYPEAHEAD_SEARCH(
        false,
        value.trim(),
        addressSpaceName,
        namespace
      )
    });
    if (
      response &&
      response.data &&
      response.data.connections &&
      response.data.connections.Connections &&
      response.data.connections.Connections.length > 0
    ) {
      //To display dropdown if fetched records are less than 100 in count.
      if (response.data.connections.Total > 100) {
        setContainerOptions([]);
      } else {
        const obtainedList = response.data.connections.Connections.map(
          (connection: any) => {
            return connection.Spec.ContainerId;
          }
        );
        setContainerOptions(obtainedList);
      }
    }
  };
  const onContainerSelectFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChangeContainerData(e.target.value);
    const options: React.ReactElement[] = containerOptions
      ? containerOptions.map((option, index) => (
          <SelectOption key={index} value={option} />
        ))
      : [];
    return options;
  };

  const onHostnameSelect = (
    event: any,
    selection: string | SelectOptionObject
  ) => {
    setHostnameSelected(selection.toString());
    setIsSelectHostnameExpanded(false);
  };

  const onContainerSelect = (
    event: any,
    selection: string | SelectOptionObject
  ) => {
    setContainerSelected(selection.toString());
    setIsSelectContainerExpanded(false);
  };

  const onDelete = (
    type: string | DataToolbarChip,
    id: string | DataToolbarChip
  ) => {
    let index;

    switch (type) {
      case "Hostname":
        if (hostnames && id) {
          index = hostnames.indexOf(id.toString());
          if (index >= 0) hostnames.splice(index, 1);
          setHostnames([...hostnames]);
        }
        break;
      case "Container":
        if (containerIds && id) {
          const containers = containerIds;
          index = containerIds.indexOf(id.toString());
          if (index >= 0) containers.splice(index, 1);
          setContainerIds([...containers]);
        }
        break;
    }
  };
  const clearAllFilters = () => {
    setHostnames([]);
    setContainerIds([]);
  };

  const checkIsFilterApplied = () => {
    if (
      (containerIds && containerIds.length > 0) ||
      (hostnames && hostnames.length > 0)
    ) {
      return true;
    }
    return false;
  };

  const toggleGroupItems = (
    <>
      <DataToolbarGroup variant="filter-group">
        <DataToolbarFilter categoryName="Filter">
          <Dropdown
            id="cl-filter-dropdown"
            position="left"
            onSelect={onFilterSelect}
            isOpen={filterIsExpanded}
            toggle={
              <DropdownToggle onToggle={setFilterIsExpanded}>
                <FilterIcon />
                &nbsp;
                {filterValue && filterValue.trim() !== ""
                  ? filterValue
                  : "Filter"}
              </DropdownToggle>
            }
            dropdownItems={filterMenuItems.map(option => (
              <DropdownItem
                id={`cl-filter-dropdown-item${option.key}`}
                key={option.key}
                value={option.value}
                itemID={option.key}
                component={"button"}
              >
                {option.value}
              </DropdownItem>
            ))}
          />
        </DataToolbarFilter>
        <DataToolbarItem>
          <DataToolbarFilter
            chips={hostnames}
            deleteChip={onDelete}
            categoryName="Hostname"
          >
            {filterValue && filterValue === "Hostname" && (
              <InputGroup>
                <Select
                  id="cl-filter-select-hostname"
                  variant={SelectVariant.typeahead}
                  aria-label="Select a hostname"
                  onToggle={onHostnameSelectToggle}
                  onSelect={onHostnameSelect}
                  onClear={() => {
                    setHostnameSelected(undefined);
                    setIsSelectHostnameExpanded(false);
                  }}
                  selections={hostnameSelected}
                  onFilter={onHostnameSelectFilterChange}
                  isExpanded={isSelectHostnameExpanded}
                  ariaLabelledBy={"typeahead-select-id"}
                  placeholderText="Select Hostname"
                  isDisabled={false}
                  isCreatable={false}
                >
                  {hostnameOptions &&
                    hostnameOptions.map((option, index) => (
                      <SelectOption key={index} value={option} />
                    ))}
                  {/* {} */}
                </Select>
                <Button
                  id="cl-filter-search-btn"
                  variant={ButtonVariant.control}
                  aria-label="search button for search input"
                  onClick={onClickSearchIcon}
                >
                  <SearchIcon />
                </Button>
              </InputGroup>
            )}
          </DataToolbarFilter>
        </DataToolbarItem>
        <DataToolbarItem>
          <DataToolbarFilter
            chips={containerIds}
            deleteChip={onDelete}
            categoryName="Container"
          >
            {filterValue && filterValue === "Container" && (
              <InputGroup>
                <Select
                  id="cl-filter-select-address"
                  variant={SelectVariant.typeahead}
                  aria-label="Select a Address"
                  onToggle={onContainerSelectToggle}
                  onSelect={onContainerSelect}
                  onClear={() => {
                    setContainerSelected(undefined);
                    setIsSelectContainerExpanded(false);
                  }}
                  selections={containerSelected}
                  onFilter={onContainerSelectFilterChange}
                  isExpanded={isSelectContainerExpanded}
                  ariaLabelledBy={"typeahead-select-id"}
                  placeholderText="Select Container"
                  isDisabled={false}
                  isCreatable={false}
                >
                  {containerOptions &&
                    containerOptions.map((option, index) => (
                      <SelectOption key={index} value={option} />
                    ))}
                  {/* {} */}
                </Select>
                <Button
                  id="cl-filter-search"
                  variant={ButtonVariant.control}
                  aria-label="search button for search input"
                  onClick={onClickSearchIcon}
                >
                  <SearchIcon />
                </Button>
              </InputGroup>
            )}
          </DataToolbarFilter>
        </DataToolbarItem>
      </DataToolbarGroup>
    </>
  );
  const toolbarItems = (
    <>
      <DataToolbarToggleGroup
        toggleIcon={
          <>
            <FilterIcon />
            {checkIsFilterApplied() && (
              <Badge key={1} isRead>
                {totalConnections}
              </Badge>
            )}
          </>
        }
        breakpoint="xl"
      >
        {toggleGroupItems}
      </DataToolbarToggleGroup>
      {width < 769 && (
        <SortForMobileView
          sortMenu={sortMenuItems}
          sortValue={sortValue}
          setSortValue={setSortValue}
        />
      )}
    </>
  );
  return (
    <>
      <DataToolbar
        id="data-toolbar-with-filter"
        className="pf-m-toggle-group-container"
        collapseListedFiltersBreakpoint="md"
        clearAllFilters={clearAllFilters}
      >
        <DataToolbarContent>{toolbarItems}</DataToolbarContent>
      </DataToolbar>
    </>
  );
};
