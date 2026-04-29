'use strict';

const LoginModule = {

  init() {
    this._bindEvents();
  },

  _bindEvents() {
    document.getElementById('formLogin')
      .addEventListener('submit', async (e) => {
        e.preventDefault();

        const user_name = document.getElementById('loginUser').value;
        const contrasena = document.getElementById('loginPass').value;

        try {
          const res = await http('/api/auth/login', 'POST', {
            user_name,
            contrasena
          });

          // guardar token
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          showToast('Bienvenido ' + res.user.nombre);

          Router.navigateTo('dashboard');

        } catch (err) {
          showToast(err.message, 'error');
        }
      });
  }

};