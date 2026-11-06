import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { CATEGORIAS } from '../data/categorias'

gsap.registerPlugin(useGSAP, ScrollTrigger)
export default function Categorias() {
 const contenedor=useRef(null)
 useGSAP(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;gsap.from('.rm-cat',{opacity:0,y:50,duration:.6,ease:'power3.out',stagger:.08,scrollTrigger:{trigger:'.rm-cat-grid',start:'top 80%',once:true}})},{scope:contenedor})
 return <section id="categorias" ref={contenedor} className="section">
    <div className="container">
        <h2 className="title is-3">Categorías</h2>
        <p className="subtitle is-6">Encuentra todo lo que necesitas en un solo lugar</p>
        <div className="columns is-multiline is-mobile rm-cat-grid">
            {CATEGORIAS.map(c=><div key={c.id} className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop rm-cat">
                <a href={`/categoria/${c.id}`} className="card rm-category-card">
                    <div className="rm-category-image">
                        <img src={c.imagen} alt={c.nombre} loading="lazy"/>
                    </div>
                    <div className="card-content has-text-centered">
                    <h3 className="title is-5 mt-1 mb-2">{c.nombre}</h3>
                    <p className="subtitle is-6">{c.detalle}</p>
                    </div>
                    <footer className="card-footer">
                        <span className="card-footer-item">Ver productos →</span>
                    </footer>
                </a>
            </div>)}
        </div>
        <div className="has-text-centered mt-4">
            <a href="/categorias" className="button is-primary is-rounded">Ver todas las categorías</a>
        </div>
    </div>
</section>
}
