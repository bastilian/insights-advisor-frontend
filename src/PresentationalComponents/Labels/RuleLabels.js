import './_RuleLabels.scss';

import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';

import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import PropTypes from 'prop-types';
import React from 'react';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const RuleLabels = ({ rule, isCompact }) => {
  const intl = useIntl();

  return (
    <React.Fragment>
      // <insert "they are the same picture" meme>
      // The following parts look a lot the same, they appear to differ in content and message.
      {rule?.tags?.search('incident') !== -1 && (
        <Tooltip
          content={intl.formatMessage(messages.incidentTooltip)}
          position={TooltipPosition.right}
        >
          <Label
            color="red"
            className="adv-c-label-incident"
            isCompact={isCompact}
          >
            {intl.formatMessage(messages.incident)}
          </Label>
        </Tooltip>
      )}
      {rule?.rule_status === 'disabled' && (
        <Tooltip
          content={intl.formatMessage(messages.ruleIsDisabledTooltip)}
          position={TooltipPosition.right}
        >
          <Label color="gray" isCompact={isCompact}>
            {intl.formatMessage(messages.disabled)}
          </Label>
        </Tooltip>
      )}
      {rule?.rule_status === 'rhdisabled' && (
        <Tooltip
          content={intl.formatMessage(messages.ruleIsDisabledTooltip)}
          position={TooltipPosition.right}
        >
          <Label color="gray" isCompact={isCompact}>
            {intl.formatMessage(messages.redhatDisabled)}
          </Label>
        </Tooltip>
      )}
    </React.Fragment>
  );
};

RuleLabels.propTypes = {
  rule: PropTypes.object,
  isCompact: PropTypes.bool,
};

RuleLabels.defaultProps = {
  isCompact: false,
};

export default RuleLabels;
