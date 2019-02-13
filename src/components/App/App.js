import React, { Component } from 'react';
import './App.scss';
import Table from '../Table/Table';
import Loading from '../Loading/Loading';

const shortUrl =
  'http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}';
const longUrl =
  'http://www.filltext.com/?rows=1000&id={number|1000}&firstName={firstName}&delay=3&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}';

class App extends Component {
  state = {
    isDataLoading: false,
    hasDataLoaded: false,
    isLoadingError: false,
    data: null,
    filteredData: null,
    dataSource: null,
    ignoreColumns: ['address', 'description'],
    filterQuery: '',
    searchInputValue: '',
    rowsPerPage: 50,
    pageCount: 1,
  };

  getPageCount = (data, rowsPerPage) => Math.ceil(data.length / rowsPerPage);

  handleFetchClick = async e => {
    if (this.state.isDataLoading) return;
    const dataSource = e.currentTarget.dataset.param;
    this.setState({
      isDataLoading: true,
      isLoadingError: false,
      hasDataLoaded: false,
    });
    let url;
    if (dataSource === 'short') {
      url = shortUrl;
    } else {
      url = longUrl;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      const filteredData = data;
      if (!data || !data.length) throw new Error('Data is empty');
      const pageCount = this.getPageCount(data, this.state.rowsPerPage);
      const filterQuery = '';
      this.setState(
        {
          hasDataLoaded: true,
          data,
          filteredData,
          dataSource,
          pageCount,
          filterQuery,
        },
        this.goToHomePage,
      );
    } catch (e) {
      this.setState({
        isLoadingError: true,
      });
    } finally {
      this.setState({
        isDataLoading: false,
      });
    }
  };

  goToHomePage = () =>
    this.props.location.pathname !== '/' ? this.props.history.push('/') : null;

  handleSearchQueryChange = e => {
    this.setState({ searchInputValue: e.currentTarget.value });
  };

  handleSearchClick = e => {
    e.preventDefault();
    const { searchInputValue, filterQuery } = this.state;
    if (filterQuery === searchInputValue) return;
    this.setState(prevState => {
      const {
        data,
        searchInputValue: filterQuery,
        ignoreColumns,
        rowsPerPage,
      } = prevState;
      const filteredData = data.filter(dataObj => {
        for (const key of Object.keys(dataObj)) {
          if (
            ignoreColumns.indexOf(key) === -1 &&
            dataObj[key].toString().indexOf(filterQuery) !== -1
          ) {
            return true;
          }
        }
        return false;
      });
      const pageCount = this.getPageCount(filteredData, rowsPerPage);
      return { filteredData, pageCount, filterQuery };
    }, this.goToHomePage);
  };

  render() {
    const {
      isDataLoading,
      isLoadingError,
      hasDataLoaded,
      // data,
      filteredData,
      dataSource,
      ignoreColumns,
      searchInputValue,
      rowsPerPage,
      pageCount,
    } = this.state;
    return (
      <div className="app">
        <header className="app__header">Таблица с данными</header>
        <section className="app__main">
          <div className="fetch">
            <div className="fetch__header">Получить данные</div>
            <button
              type="button"
              className="fetch__button"
              data-param="short"
              onClick={this.handleFetchClick}
            >
              32 строки
            </button>
            <button
              type="button"
              className="fetch__button"
              data-param="long"
              onClick={this.handleFetchClick}
            >
              1000 строк
            </button>
          </div>
          <Loading
            isLoading={isDataLoading}
            isError={isLoadingError}
            hasLoaded={hasDataLoaded}
          >
            <form
              autoComplete="off"
              onSubmit={this.handleSearchClick}
              className="app__search"
            >
              <input
                type="text"
                name="filter-query"
                value={searchInputValue}
                onChange={this.handleSearchQueryChange}
                placeholder={'Поиск'}
              />
              <button>Найти</button>
            </form>
            <Table
              data={filteredData}
              dataSource={dataSource}
              ignoreColumns={ignoreColumns}
              rowsPerPage={rowsPerPage}
              pageCount={pageCount}
            />
          </Loading>
        </section>
      </div>
    );
  }
}

export default App;
