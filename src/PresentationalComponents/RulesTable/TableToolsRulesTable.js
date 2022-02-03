import React from 'react';
import propTypes from 'prop-types';
import { TableToolsTableAsync as TableToolsTable } from '@redhat-cloud-services/frontend-components/TableToolsTable';
import * as Columns from './Columns';

const RulesTable = () => {
  return (
    <TableToolsTable
      getItems={async (...args) => {
        console.log(...args);

        return {
          items: [{ name: 'Test Name' }],
          totalItemsCount: 1,
        };
      }}
      columns={[Columns.Name]}
    />
  );
};

export default RulesTable;
