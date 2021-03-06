/* eslint-disable no-param-reassign */
// don't actually throw any errors here, just collect them and pass as props

const validatePasswordConfirmation = (password, confirmPassword, errors) => {
  if (password.trim() === '') {
    errors.password = 'Password empty';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Password does't match";
  }
  return errors;
};

const validateRegisterInput = (username, email, password, confirmPassword) => {
  // building up the error object based on the validation errors a user may encounter
  let errors = {};

  // handle username
  if (username.trim() === '') {
    errors.username = 'Username empty';
  }

  // handle email
  if (email.trim() === '') {
    errors.email = 'Email empty';
  } else {
    const emailRegEx = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!email.match(emailRegEx)) {
      errors.email = 'Email not valid';
    }
  }
  errors = validatePasswordConfirmation(password, confirmPassword, errors);

  return {
    errors,
    // valid key will be used to let us know if there were any erros in the first place
    // returns true if this object has no errors
    valid: Object.keys(errors).length < 1,
  };
};

const validateLoginInput = (username, password) => {
  const errors = {};

  // handle username
  if (username.trim() === '') {
    errors.username = 'Username empty';
  }
  if (password.trim() === '') {
    errors.password = 'Password empty';
  }

  return {
    errors,
    // valid key will be used to let us know if there were any erros in the first place
    // returns true if this object has no errors
    valid: Object.keys(errors).length < 1,
  };
};

const validatePostInput = (body) => {
  const errors = {};
  if (body.trim() === '') errors.body = 'Body empty';
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validatePasswordConfirmation,
  validatePostInput,
};
