import React from 'react';
import { FormattedMessage } from 'react-intl';
import { cellWidth, fitContent } from '@patternfly/react-table';
import NameCell from './Components/NameCell';

// eslint-disable-next-line react/display-name
export const renderComponent = (Component, props) => (_data, _id, entity) =>
  <Component {...entity} {...props} />;

export const Name = {
  title: <FormattedMessage id="name" />,
  sortByProp: 'name',
  transforms: [cellWidth(40)],
  renderFunc: renderComponent(NameCell),
};

export const Added = {
  title: <FormattedMessage id="added" />,
  transforms: [cellWidth(10)],
};
export const Category = {
  title: <FormattedMessage id="category" />,
  transforms: [cellWidth(10)],
};
export const TotalRisk = {
  title: <FormattedMessage id="totalRisk" />,
  transforms: [cellWidth(15)],
};
export const RiskOfChange = {
  title: <FormattedMessage id="riskofchange" />,
  transforms: [cellWidth(15)],
};
export const Systems = {
  title: <FormattedMessage id="systems" />,
  transforms: [cellWidth(15)],
};
export const Remediation = {
  title: <FormattedMessage id="remediation" />,
  transforms: [cellWidth(15), fitContent],
};

export default [
  Name,
  // Added,
  // Category,
  // TotalRisk,
  // RiskOfChange,
  // Systems,
  // Remediation,
];
