import { useEffect, useState } from 'react'
import CartIcon from './CartIcon'
import PersonIcon from './PersonIcon'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import { CATEGORIAS } from '../data/categorias'
import './Navbar.css'

export default function Navbar({ busqueda = '', onBuscar = () => {} }) {
 const [menuAbierto,setMenuAbierto]=useState(false)
 const {cantidadTotal,abrirCarrito}=useCarrito()
 const {usuario}=useAuth()
    useEffect(() => {
    document.documentElement.classList.add('has-navbar-fixed-top')
    return () => document.documentElement.classList.remove('has-navbar-fixed-top')
    }, [])
 const enviarBusqueda=e=>{e.preventDefault();window.location.href='/?q='+encodeURIComponent(busqueda)+'#productos'}
 return <nav className="navbar is-dark is-fixed-top rm-navbar" role="navigation" aria-label="main navigation"><div className="navbar-brand"><a className="navbar-item" href="/"><strong className="rm-brand">RiverMarket</strong></a><button className={'navbar-burger '+(menuAbierto?'is-active':'')} aria-label="Abrir menú" aria-expanded={menuAbierto} onClick={()=>setMenuAbierto(!menuAbierto)}><span/><span/><span/><span/></button></div><div className={'navbar-menu '+(menuAbierto?'is-active':'')}><div className="navbar-start"><a className="navbar-item rm-link" href="/">Inicio</a><a className="navbar-item rm-link" href="/#ofertas">Ofertas</a><a className="navbar-item rm-link" href="/#productos">Productos</a><a className="navbar-item rm-link" href="/recetas">Recetas</a><div className="navbar-item has-dropdown is-hoverable"><a className="navbar-link rm-link" href="/categorias">Categorías</a><div className="navbar-dropdown"><a className="navbar-item" href="/categorias"><b>Ver todas las categorías</b></a><hr className="navbar-divider"/>{CATEGORIAS.map(c=><a key={c.id} className="navbar-item" href={'/categoria/'+c.id}>{c.nombre}</a>)}</div></div></div><form className="navbar-item rm-search" role="search" onSubmit={enviarBusqueda}><div className="control is-expanded"><input className="input is-rounded" type="search" placeholder="Buscar productos..." aria-label="Buscar productos" value={busqueda} onChange={e=>onBuscar(e.target.value)}/></div></form><div className="navbar-end"><a className="navbar-item" href="/ingresar"><span className="icon is-medium has-text-warning"><PersonIcon/></span><span className="ml-2 has-text-weight-bold">{usuario?usuario.nombre:'Mi cuenta'}</span></a><button type="button" className="navbar-item rm-cart-btn" aria-label={'Abrir carrito, '+cantidadTotal+' productos'} onClick={abrirCarrito}><span className="icon is-medium rm-cart"><CartIcon/><span className="tag is-warning is-rounded rm-badge">{cantidadTotal}</span></span></button></div></div></nav>
}
