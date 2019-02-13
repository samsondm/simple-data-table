import React from 'react';

const TableDetails = ({
  fullName,
  address: { streetAddress, city, state, zip },
  description,
}) => {
  return (
    <div className="table__details">
      <div>
        Выбран пользователь <b>{fullName}</b>
      </div>
      <div>Описание:</div>
      <div>
        <textarea defaultValue={description} />
      </div>
      <div>
        Адрес проживания: <b>{streetAddress}</b>
      </div>
      <div>
        Город: <b>{city}</b>
      </div>
      <div>
        Провинция/штат: <b>{state}</b>
      </div>
      <div>
        Индекс: <b>{zip}</b>
      </div>
    </div>
  );
};

export default TableDetails;
