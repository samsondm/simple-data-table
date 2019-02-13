import React from 'react';
import App from './App';
import { mount } from 'enzyme';
import { superShort, long } from '../../data/testData';
import { MemoryRouter, Route } from 'react-router-dom';
import {
  render,
  fireEvent,
  cleanup,
  waitForElement,
} from 'react-testing-library';

function mockFetchWithData(data, ms = 500, isError = false) {
  return jest.spyOn(window, 'fetch').mockImplementation(async () => {
    return new Promise((resolve, reject) =>
      !isError
        ? setTimeout(resolve, ms, {
            ok: true,
            json: () =>
              new Promise(resolve => {
                resolve(data);
              }),
          })
        : reject('Error'),
    );
  });
}

const renderApp = () =>
  render(
    <MemoryRouter>
      <Route component={App} />
    </MemoryRouter>,
  );

const renderTable = () => {
  const app = renderApp();
  const shortButton = app.queryByText('32 строки');
  fireEvent.click(shortButton);
  return app;
};

beforeAll(() => {
  jest.restoreAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

it('renders without crashing', () => {
  mount(<App />);
});

it("Doesn't render search box or table if data not loaded", () => {
  const { queryByPlaceholderText } = renderApp();

  expect(queryByPlaceholderText('Поиск')).not.toBeInTheDocument();
  expect(document.querySelector('table')).not.toBeInTheDocument();
});

it('Does not fetch data if fetch in progress', async () => {
  const testSample = superShort;
  const fetch = mockFetchWithData(testSample, 2000);
  const { queryByText, queryByPlaceholderText } = renderApp();
  const shortButton = queryByText('32 строки');
  const longButton = queryByText('1000 строк');

  expect(fetch).toHaveBeenCalledTimes(0);
  fireEvent.click(shortButton);
  expect(fetch).toHaveBeenCalledTimes(1);

  let loading = await waitForElement(() => queryByText('Loading...'));
  expect(loading).toBeInTheDocument();

  fireEvent.click(shortButton);
  expect(fetch).toHaveBeenCalledTimes(1);
  fireEvent.click(longButton);
  expect(fetch).toHaveBeenCalledTimes(1);

  const input = await waitForElement(() => queryByPlaceholderText('Поиск'));
  loading = queryByText('Loading...');
  expect(loading).not.toBeInTheDocument();
  expect(input).toBeInTheDocument();
});

it('Renderes search box and table after data fetch', async () => {
  const testSample = superShort;
  mockFetchWithData(testSample, 1000);
  const { queryByPlaceholderText } = renderTable();

  await waitForElement(() => queryByPlaceholderText('Поиск'));

  const nav = document.querySelector('.table__nav');
  expect(nav).not.toBeInTheDocument();

  const rows = document.querySelectorAll('.table__row').length;
  expect(rows).toBe(testSample.length);

  const headCells = document.querySelectorAll('.table__cell_head__name');
  expect(headCells.length).toBe(5);
  expect([...headCells].map(cell => cell.textContent)).toEqual([
    'id',
    'firstName',
    'lastName',
    'email',
    'phone',
  ]);
}, 10000);

it('Renderes error on fetch reject', async () => {
  const testSample = superShort;
  const fetch = mockFetchWithData(testSample, 0, true);
  const { queryByText } = renderTable();

  expect(fetch).toHaveBeenCalledTimes(1);

  let loading = await waitForElement(() => queryByText('Loading error!'));
  expect(loading).toBeInTheDocument();
});

it('Can type in search box', async () => {
  const testSample = superShort;
  mockFetchWithData(testSample);
  const { queryByPlaceholderText } = renderTable();

  const text = 'test';
  let input = await waitForElement(() => queryByPlaceholderText('Поиск'));
  expect(input).toBeInTheDocument();
  fireEvent.change(input, { target: { value: text } });
  expect(input.value).toBe(text);
});

it('Filter results on search submit', async () => {
  const testSample = superShort;
  mockFetchWithData(testSample);
  const { queryByPlaceholderText, queryByText } = renderTable();

  let text, input, rows, cell;
  // searched in IDs
  text = testSample[0].id.toString();
  input = await waitForElement(() => queryByPlaceholderText('Поиск'));
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input);

  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(1);
  cell = queryByText(text);
  expect(cell).toBeInTheDocument();

  // search in firstName
  text = testSample[1].firstName;
  fireEvent.change(input, { target: { value: text } });
  const search = queryByText('Найти');
  fireEvent.click(search);

  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(1);
  cell = queryByText(text);
  expect(cell).toBeInTheDocument();

  // search in lastName
  text = testSample[2].lastName;
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input);

  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(1);
  cell = queryByText(text);
  expect(cell).toBeInTheDocument();

  // search in email
  text = '.com';
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input);

  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(2);
  cell = queryByText(testSample[3].lastName);
  expect(cell).toBeInTheDocument();
  cell = queryByText(testSample[4].lastName);
  expect(cell).toBeInTheDocument();

  // search in email
  text = '-0';
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input);

  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(2);
  cell = queryByText(testSample[0].lastName);
  expect(cell).toBeInTheDocument();
  cell = queryByText(testSample[1].lastName);
  expect(cell).toBeInTheDocument();

  // ignores description
  text = testSample[2].description;
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input);

  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(0);

  // ignores address
  text = testSample[2].address.zip;
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input);

  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(0);
});

it('Sorts rows when table heading is clicked', async () => {
  const testSample = superShort;
  mockFetchWithData(testSample);
  const { queryByText, queryAllByText } = renderTable();

  let rows, sortIndicator;
  const id = await waitForElement(() => queryByText('id'));
  expect(id).toBeInTheDocument();

  // no sort indicators before click
  sortIndicator = queryAllByText('▲');
  expect(sortIndicator.length).toBe(0);
  sortIndicator = queryAllByText('▼');
  expect(sortIndicator.length).toBe(0);

  fireEvent.click(id);
  sortIndicator = queryAllByText('▲');
  expect(sortIndicator.length).toBe(1);
  expect(sortIndicator[0]).toBe(id.nextElementSibling);
  rows = document.querySelectorAll('.table__row');
  expect([...rows].map(row => row.firstElementChild.textContent)).toEqual([
    '146',
    '170',
    '552',
    '579',
    '706',
  ]);

  fireEvent.click(id);
  sortIndicator = queryAllByText('▼');
  expect(sortIndicator.length).toBe(1);
  expect(sortIndicator[0]).toBe(id.nextElementSibling);
  rows = document.querySelectorAll('.table__row');
  expect([...rows].map(row => row.firstElementChild.textContent)).toEqual([
    '706',
    '579',
    '552',
    '170',
    '146',
  ]);

  const firstName = queryByText('firstName');
  fireEvent.click(firstName);
  sortIndicator = queryAllByText('▲');
  expect(sortIndicator.length).toBe(1);
  expect(sortIndicator[0]).toBe(firstName.nextElementSibling);
  rows = document.querySelectorAll('.table__row');
  expect([...rows].map(row => row.firstElementChild.textContent)).toEqual([
    '706',
    '552',
    '579',
    '170',
    '146',
  ]);
});

it('Renders details on row click', async () => {
  const testSample = superShort;
  mockFetchWithData(testSample);
  const { queryByText } = renderTable();

  let row, details;
  row = await waitForElement(() => document.querySelector('.table__row'));
  details = document.querySelector('.table__details');
  expect(details).not.toBeInTheDocument();
  fireEvent.click(row);
  details = document.querySelector('.table__details');
  expect(details).toBeInTheDocument();

  const {
    firstName,
    lastName,
    description,
    address: { streetAddress, city, state, zip },
  } = testSample[0];
  const user = queryByText(`${firstName} ${lastName}`);
  expect(details).toContainElement(user);
  const descriptionNode = queryByText(description);
  expect(details).toContainElement(descriptionNode);
  const streetAddressNode = queryByText(streetAddress);
  expect(details).toContainElement(streetAddressNode);
  const cityNode = queryByText(city);
  expect(details).toContainElement(cityNode);
  const stateNode = queryByText(state);
  expect(details).toContainElement(stateNode);
  const zipNode = queryByText(zip);
  expect(details).toContainElement(zipNode);
});

it('Renders navigation on data containing more than 50 rows', async () => {
  const testSample = long;
  mockFetchWithData(testSample);
  const { queryByText } = renderTable();

  let rows;
  const nav = await waitForElement(() => document.querySelector('.table__nav'));
  expect(nav).toBeInTheDocument();
  const navLinks = nav.querySelectorAll('.table__nav__link');
  expect([...navLinks].map(navLink => navLink.textContent)).toEqual([
    '0',
    '1',
    '2',
  ]);

  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(50);
  expect([...rows].map(row => row.firstElementChild.textContent)).toEqual(
    testSample.slice(0, 50).map(dataObj => dataObj.id.toString()),
  );

  const navLink = queryByText('2');
  fireEvent.click(navLink);
  rows = document.querySelectorAll('.table__row');
  expect(rows.length).toBe(50);
  expect([...rows].map(row => row.firstElementChild.textContent)).toEqual(
    testSample.slice(100, 150).map(dataObj => dataObj.id.toString()),
  );
});
