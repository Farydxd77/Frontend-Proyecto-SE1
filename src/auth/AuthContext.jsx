import { createContext, useState } from "react";
import { fetchSinToken } from "../helpers/fetch";


export const AuthContext = createContext();

const initialState = {
    uid: null,
    checking: true,
    logged: false,
    name: null,
    email: null,
};

export const AuthProvider = ({children}) => {
    const [auth, setAuth ] = useState(initialState);


    const login = async( email, password ) => {
        const resp = await fetchSinToken('auth/login', {email , password},'POST');
        console.log( resp )
    
            localStorage.setItem('token', resp.token );
            setAuth({
                uid: resp.id,
                checking: false,
                logged: true,
                name: resp.nombre,
                email: resp.email,
            })
    
        return true;
        
    }
     const register = async( email, password ) => {
        const resp = await fetchSinToken('auth/login', {email , password},'POST');
            if ( resp.ok ) {
                localStorage.setItem('token', resp.token);               
                const { usuario } = resp;
                setAuth({
                    uid: usuario.uid,
                    checking: false,
                    logged: true,
                    name: usuario.nombre,
                    email: usuario.email,
                })
                console.log('autenticado!')
                return true;
            }
            return resp.msg;
    }

 const logout = () => {
        localStorage.removeItem('token');
        setAuth({
            checking: false,
            logged: false,
        })
    } 


    return (
        <AuthContext.Provider value={{
            auth,
            login,
            register,
            logout
        }} >
            {children}
        </AuthContext.Provider>
    )
}