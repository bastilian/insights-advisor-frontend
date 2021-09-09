import { DEBOUNCE_DELAY, FILTER_CATEGORIES as FC } from '../../AppConstants';
import { Link, useLocation } from 'react-router-dom';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
  cellWidth,
  fitContent,
  info,
  sortable,
} from '@patternfly/react-table';
import {
  filterFetchBuilder,
  paramParser,
  pruneFilters,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import { useDispatch, useSelector } from 'react-redux';

import CategoryLabel from '../Labels/CategoryLabel';
import Failed from '../Loading/Failed';
import Loading from '../Loading/Loading';
import MessageState from '../MessageState/MessageState';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import RecommendationLevel from '../Labels/RecommendationLevel';
import RuleLabels from '../Labels/RuleLabels';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import debounce from '../../Utilities/Debounce';
import messages from '../../Messages';
import { updatePathFilters } from '../../Services/Filters';
import { useGetPathwaysQuery } from '../../Services/Pathways';
import { useIntl } from 'react-intl';

const PathwaysTable = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { search } = useLocation();

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const filters = useSelector(({ filters }) => filters.pathState);
  const setFilters = (filters) => dispatch(updatePathFilters(filters));
  let options = {};
  selectedTags?.length &&
    (options = {
      ...options,
      ...{ tags: selectedTags.join(',') },
    });
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
  const {
    data: pathways = [],
    isFetching,
    isLoading,
    isError,
  } = useGetPathwaysQuery({ ...filterFetchBuilder(filters), ...options });

  const cols = [
    {
      title: intl.formatMessage(messages.pathway),
      transforms: [sortable, cellWidth(45)],
    },
    {
      title: intl.formatMessage(messages.category),
      transforms: [sortable, cellWidth(15)],
    },
    {
      title: intl.formatMessage(messages.systems),
      transforms: [sortable, cellWidth(10)],
    },
    {
      title: intl.formatMessage(messages.reboot),
      transforms: [sortable, cellWidth(10)],
    },
    {
      title: intl.formatMessage(messages.reclvl),
      transforms: [
        sortable,
        cellWidth(20),
        fitContent,
        info({
          tooltip: intl.formatMessage(messages.reclvldetails),
          tooltipProps: {
            isContentLeftAligned: true,
          },
        }),
      ],
    },
  ];
  const sortIndices = {
    0: 'description',
    1: 'category',
    2: 'impacted_systems_count',
    3: 'reboot_required',
    4: 'recommendation_level',
  };
  const [sortBy, setSortBy] = useState({});
  const [filterBuilding, setFilterBuilding] = useState(true);
  const [searchText, setSearchText] = useState(filters?.text || '');
  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);

  const onSort = (_event, index, direction) => {
    const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
    setSortBy({ index, direction });
    setFilters({ ...filters, sort: orderParam, offset: 0 });
  };

  const onSetPage = (pageNumber) => {
    const newOffset = pageNumber * filters.limit - filters.limit;
    setFilters({ ...filters, offset: newOffset });
  };

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sort;
    delete localFilters.offset;
    delete localFilters.limit;

    return pruneFilters(localFilters, FC);
  };

  const rowBuilder = (pathways) =>
    pathways.length === 0
      ? [
          {
            cells: [
              {
                title: (
                  <MessageState
                    icon={SearchIcon}
                    title={intl.formatMessage(messages.noResults)}
                    text={intl.formatMessage(messages.adjustFilters)}
                  />
                ),
                props: { colSpan: 6 },
              },
            ],
          },
        ]
      : pathways.flatMap((pathway, key) => [
          {
            cells: [
              {
                title: (
                  <span key={key}>
                    <Link key={key} to={`/pathways/${pathway.name}`}>
                      {' '}
                      {pathway.description}{' '}
                    </Link>
                    {pathway.has_incident && (
                      <RuleLabels rule={{ tags: 'incident' }} />
                    )}
                  </span>
                ),
              },
              {
                title: (
                  <CategoryLabel key={key} labelList={pathway.categories} />
                ),
              },
              {
                title: (
                  <div
                    key={key}
                  >{`${pathway.impacted_systems_count.toLocaleString()}`}</div>
                ),
              },
              {
                title: (
                  <span key={key}>
                    {intl.formatMessage(
                      pathway.reboot_required
                        ? messages.required
                        : messages.notRequired
                    )}
                  </span>
                ),
              },
              {
                title: <RecommendationLevel key={key} {...pathway} />,
              },
            ],
          },
        ]);

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    param === 'text' && setSearchText('');
    delete filter[param];
    setFilters(filter);
  };

  const addFilterParam = (param, values) => {
    values.length > 0
      ? setFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param);
  };

  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) => setSearchText(value),
        value: searchText,
        placeholder: intl.formatMessage(messages.filterBy),
      },
    },
    {
      label: FC.category.title,
      type: FC.category.type,
      id: FC.category.urlParam,
      value: `checkbox-${FC.category.urlParam}`,
      filterValues: {
        key: `${FC.category.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.category.urlParam, values),
        value: filters.category,
        items: FC.category.values,
      },
    },
    {
      label: FC.incident.title,
      type: FC.incident.type,
      id: FC.incident.urlParam,
      value: `checkbox-${FC.incident.urlParam}`,
      filterValues: {
        key: `${FC.incident.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.incident.urlParam, values),
        value: filters.incident,
        items: FC.incident.values,
      },
    },
    {
      label: FC.reboot.title,
      type: FC.reboot.type,
      id: FC.reboot.urlParam,
      value: `checkbox-${FC.reboot.urlParam}`,
      filterValues: {
        key: `${FC.reboot.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.reboot.urlParam, values),
        value: filters.reboot,
        items: FC.reboot.values,
      },
    },
  ];

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        setSearchText('');
        setFilters({
          limit: filters.limit,
          offset: filters.offset,
        });
      } else {
        itemsToRemove.map((item) => {
          const newFilter = {
            [item.urlParam]: Array.isArray(filters[item.urlParam])
              ? filters[item.urlParam].filter(
                  (value) => String(value) !== String(item.chips[0].value)
                )
              : '',
          };
          newFilter[item.urlParam].length > 0
            ? setFilters({ ...filters, ...newFilter })
            : removeFilterParam(item.urlParam);
        });
      }
    },
  };

  useEffect(() => {
    if (!filterBuilding && selectedTags !== null) {
      urlBuilder(filters, selectedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedTags, workloads, SID]);

  useEffect(() => {
    if (search && filterBuilding) {
      const paramsObject = paramParser();
      delete paramsObject.tags;

      paramsObject.text === undefined
        ? setSearchText('')
        : setSearchText(paramsObject.text);
      paramsObject.sort =
        paramsObject.sort === undefined
          ? '-impacted_systems_count'
          : paramsObject.sort[0];
      paramsObject.offset === undefined
        ? (paramsObject.offset = 0)
        : (paramsObject.offset = Number(paramsObject.offset[0]));
      paramsObject.limit === undefined
        ? (paramsObject.limit = 20)
        : (paramsObject.limit = Number(paramsObject.limit[0]));
      paramsObject.reboot !== undefined &&
        !Array.isArray(paramsObject.reboot) &&
        (paramsObject.reboot = [`${paramsObject.reboot}`]);

      setFilters({ ...filters, ...paramsObject });
    }

    setFilterBuilding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filters.sort !== undefined && sortIndices) {
      let sortInput = filters.sort;
      const sortIndex = Number(
        Object.entries(sortIndices).find(
          (item) => item[1] === sortInput || `-${item[1]}` === sortInput
        )[0]
      );
      const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
      setSortBy({ index: sortIndex, direction: sortDirection });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort]);

  useEffect(() => {
    if (!filterBuilding && !isLoading) {
      const filter = { ...filters };
      const text = searchText.length ? { text: searchText } : {};
      delete filter.text;
      setFilters({ ...filter, ...text, offset: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  return (
    <React.Fragment>
      <PrimaryToolbar
        pagination={{
          itemCount: pathways?.meta?.count || 0,
          page: filters.offset / filters.limit + 1,
          perPage: Number(filters.limit),
          onSetPage(_event, page) {
            onSetPage(page);
          },
          onPerPageSelect(_event, perPage) {
            setFilters({ ...filters, limit: perPage, offset: 0 });
          },
          isCompact: true,
        }}
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
      />
      {isFetching ? (
        <Loading />
      ) : isError ? (
        <Failed
          message={intl.formatMessage(messages.rulesTableFetchRulesError)}
        />
      ) : (
        <Table
          aria-label={'pathways-table'}
          variant={TableVariant.compact}
          sortBy={sortBy}
          onSort={onSort}
          cells={cols}
          rows={rowBuilder(pathways?.data)}
          isStickyHeader
        >
          <TableHeader />
          <TableBody />
        </Table>
      )}
      <Pagination
        ouiaId="page"
        itemCount={pathways?.meta?.count || 0}
        page={filters.offset / filters.limit + 1}
        perPage={Number(filters.limit)}
        onSetPage={(_e, page) => {
          onSetPage(page);
        }}
        onPerPageSelect={(_e, perPage) => {
          setFilters({ ...filters, limit: perPage, offset: 0 });
        }}
        widgetId={`pagination-options-menu-bottom`}
        variant={PaginationVariant.bottom}
      />
    </React.Fragment>
  );
};

export default PathwaysTable;