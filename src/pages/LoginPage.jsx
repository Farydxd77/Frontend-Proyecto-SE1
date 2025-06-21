import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../auth/AuthContext';
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2';
import '../css/login-register.css'

export const LoginPage = () => {
    const {login} = useContext(AuthContext);

    const [form, setFrom] = useState({
        email: 'rosem@gmail.com',
        password: 'Leyendas13',
        rememberme: false
    });
    
    useEffect(() => {
        const email = localStorage.getItem('email');
        if( email ) {
            setFrom( (from) =>({
                ...from,
                rememberme: true,
                email
            }))
        }
    }, [])
    
    const onChange = ( { target } ) => {
        const { name, value } = target;

        setFrom({
            ...form,
            [name]: value
        })
    }

    const toggleCheck = () => {
        setFrom({
            ...form,
            rememberme: !form.rememberme  // ✅ Corregido: agregué la negación
        })
    }

    const onSubmit = async( ev) => {
        ev.preventDefault();

        if( form.rememberme) {
            localStorage.setItem('email', form.email);
        } else {
            localStorage.removeItem('email');
        }

        //llarmar al backend
        const { email, password } = form;
        const ok = await login( email, password );
        if ( !ok ){
            Swal.fire('Error', 'Verifique el usuario y contrasena', 'error');
        }
    }

    const todoOk = () => {
      return ( form.email.length > 0 && form.password.length > 0) ? true : false;
    }

    return (
        <div className="limiter">
            <div className="container-login100">
                <div className="wrap-login100 p-t-50 p-b-90">
                    <form 
                        className="login100-form validate-form flex-sb flex-w"
                        onSubmit={ onSubmit }
                    >
                        <span className="login100-form-title p-b-51">
                          Ingreso
                        </span>
                        
                        <div className="wrap-input100 validate-input m-b-36">
                          <input 
                            className="input100" 
                            type="email" 
                            name="email"
                            placeholder="Email" 
                            value={ form.email }
                            onChange={ onChange } 
                          />
                          <span className="focus-input100"></span>
                        </div>
                        
                        <div className="wrap-input100 validate-input m-b-12">
                          <input
                            className="input100" 
                            type="password"
                            name="password" 
                            placeholder="Password" 
                            value={ form.password }
                            onChange={ onChange } 
                          />
                          <span className="focus-input100"></span>
                        </div>
                        
                        <div className="flex-sb-m w-full p-t-25 p-b-25">
                          <div className="contact100-form-checkbox">
                            <input
                              className="input-checkbox100"
                              id="ckb1"
                              type="checkbox"
                              name="rememberme" 
                              checked={ form.rememberme }
                              onChange={ toggleCheck }
                            />
                            <label className="label-checkbox100" htmlFor="ckb1">
                              Recordarme
                            </label>
                          </div>

                          <div>
                            <Link to='/auth/register' className="txt1">
                              Nueva cuenta?
                            </Link>
                          </div>
                        </div>

                        <div className="container-login100-form-btn">
                          <button
                            type='submit'
                            className="login100-form-btn"
                            disabled={ !todoOk() }
                          >
                            Ingresar
                          </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}