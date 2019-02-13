import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import TableHeadCell from './TableHeadCell';
import TableRow from './TableRow';
import './Table.scss';
import TableDetails from './TableDetails';
import TableNav from './TableNav';

class Table extends Component {
  state = {
    sortName: '',
    sortState: 0,
    dataSource: null,
    columnNames: null,
    pageCount: 0,
    details: {
      fullName: null,
      address: null,
      description: null,
    },
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.dataSource !== prevState.dataSource) {
      const { data, dataSource } = nextProps;
      const columnNames = Object.keys(data[0]);
      const details = {
        fullName: null,
        address: null,
        description: null,
      };
      return {
        columnNames,
        dataSource,
        details,
      };
    }
    return null;
  }

  getSortedData() {
    const { data } = this.props;
    const newData = [...data];
    const { sortName, sortState } = this.state;
    return newData.sort((a, b) => {
      // debugger;
      let ascend;
      if (typeof a[sortName] === 'string') {
        ascend = a[sortName].localeCompare(b[sortName]);
      } else {
        ascend = a[sortName] - b[sortName];
      }
      return Math.sign(sortState) * ascend;
    });
  }

  handleHeadClick = name => {
    this.setState(prevState => {
      const { sortName, sortState } = prevState;
      let newSortState;
      if (sortName === name) {
        newSortState = -sortState;
      } else {
        newSortState = 1;
      }
      return { sortName: name, sortState: newSortState };
    });
  };

  handleRowClick = ({ fullName, address, description }) => {
    this.setState(prevState => {
      const {
        details: {
          address: oldAdress,
          description: oldDescription,
          fullName: oldFullName,
        },
      } = prevState;
      if (
        fullName !== oldFullName ||
        address !== oldAdress ||
        description !== oldDescription
      ) {
        const details = { address, description, fullName };
        return { details };
      } else {
        return {};
      }
    });
  };

  getSortIndecator = name =>
    name !== this.state.sortName ? '  ' : this.state.sortState > 0 ? '▲' : '▼';

  getTableRows = dataObj => (
    <TableRow
      key={`${dataObj.id}-${dataObj.lastName}`}
      dataObj={dataObj}
      handleRowClick={this.handleRowClick}
      ignoreColumns={this.props.ignoreColumns}
    />
  );

  render() {
    const { data, ignoreColumns, pageCount, rowsPerPage } = this.props;
    const {
      sortState,
      columnNames,
      details: { fullName, address, description },
    } = this.state;
    const sortedData = !sortState ? data : this.getSortedData();

    const thead = columnNames.map(name =>
      ignoreColumns.indexOf(name) !== -1 ? null : (
        <TableHeadCell
          key={name}
          name={name}
          handleHeadClick={this.handleHeadClick}
          sortIndicator={this.getSortIndecator(name)}
        />
      ),
    );

    const tableMain = sortedData.slice(0, rowsPerPage).map(this.getTableRows);

    let splitTableByPages = [];
    for (let page = 1; page < pageCount; page++) {
      const tablePage = (
        <Route
          key={page.toString()}
          path={`/${page}`}
          render={() =>
            sortedData
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map(this.getTableRows)
          }
        />
      );
      splitTableByPages.push(tablePage);
    }

    const tableNav =
      pageCount !== 1 ? <TableNav pageCount={pageCount} /> : null;

    const tableDetails =
      fullName !== null ? (
        <TableDetails
          fullName={fullName}
          address={address}
          description={description}
        />
      ) : null;

    return (
      <div>
        {tableNav}
        <table className="table">
          <thead>
            <tr>{thead}</tr>
          </thead>
          <tbody>
            <Switch>
              <Route exact path="/" render={() => tableMain} />
              {splitTableByPages}
            </Switch>
          </tbody>
        </table>
        {tableDetails}
      </div>
    );
  }
}

export default Table;
