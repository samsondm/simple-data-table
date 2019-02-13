import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';

const TableNav = ({ pageCount, location }) => {
  let pageNav = [];
  for (let page = 0; page < pageCount; page++) {
    const pageName = page;
    if (page === 0) page = '';
    const to = `/${page}`;
    const navButton = (
      <li key={page} className="table__nav__link">
        <NavLink
          activeClassName="nav-link_active"
          exact
          replace={to === location.pathname}
          to={to}
        >
          {pageName}
        </NavLink>
      </li>
    );
    pageNav.push(navButton);
  }

  return <ul className="table__nav">{pageNav}</ul>;
};

export default withRouter(TableNav);
