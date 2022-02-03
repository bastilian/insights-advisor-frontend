import React from 'react';
import { Link } from 'react-router-dom';
import RuleLabels from '../../Labels/RuleLabels';

const Name = (rule) => {
  const { rule_id, description } = rule;

  return (
    <span>
      <Link to={`/recommendations/${rule_id}`}> {description} </Link>
      <RuleLabels rule={rule} />
    </span>
  );
};

export default Name;
