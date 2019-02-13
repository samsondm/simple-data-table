import React from 'react';

const TableRow = ({ handleRowClick, dataObj, ignoreColumns }) => {
  const row = Object.keys(dataObj).map(propName =>
    ignoreColumns.indexOf(propName) !== -1 ? null : (
      <td key={propName} className="table__cell">
        {dataObj[propName]}
      </td>
    ),
  );

  const getFullName = (firstName, lastName) => `${firstName} ${lastName}`;

  const handleClick = e => {
    const { address, description, firstName, lastName } = dataObj;
    const details = {
      fullName: getFullName(firstName, lastName),
      address,
      description,
    };
    handleRowClick(details);
  };

  return (
    <tr className="table__row" onClick={handleClick}>
      {row}
    </tr>
  );
};

export default TableRow;
