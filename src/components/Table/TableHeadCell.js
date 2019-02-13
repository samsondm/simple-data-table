import React from 'react';

const TableHeadCell = ({ name, handleHeadClick, sortIndicator }) => {
  const handleClick = e => {
    handleHeadClick(name);
  };
  return (
    <th
      key={name}
      className="table__cell table__cell_head"
      onClick={handleClick}
    >
      <span className="table__cell_head__name">{name}</span>
      <span className="table__cell_head__sort">{sortIndicator}</span>
    </th>
  );
};

export default TableHeadCell;
