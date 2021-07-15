/*
* Comenzar el proceso de análisis y visualización cuando el documento esté listo
*/
if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    initMap();
} else {
    document.addEventListener("DOMContentLoaded", initMap);
}

/* VARIABLES GLOBALES */
let map;
let popup; //Lo declaramos de forma global porque la función donde lo utilizamos (bind_event) es distinta a la función donde lo inicializamos (initMap)
let visibleLayerId = ''; //Si trabajamos con más de un layer visible/no-visible en el mapa

/* (Opcional) Ajustar ZOOM, MINZOOM Y CENTER EN FUNCIÓN DEL DISPOSITIVO */
let zoom = 13.56;
let minZoom = 4;
let center = [2.182802, 41.381472]; //Específico para Catalunya
let pitch = 59.96; // pitch in degrees
let bearing = -51.42; // bearing in degrees
let barriosids = ["eixample_circulos", "gracia_circulos", "horta_circulos", "lescorts_circulos", "nouBarris_circulos", "sanAndreu_circulos", "sants_montjuic_circulos", "sanMarti_circulos", "ciutat_vella_circulos", "sarria_circulos"];
let allFilter = true;
let firstFilter = false;
let secFilter = false;
let thirdFilter = false;

/* FUNCIÓN PARA LA INICIALIZACIÓN DEL MAPA (https://docs.mapbox.com/mapbox-gl-js/api/map/) */
/*
* - Disposición del token de acceso
* - Control de la escala (opcional)
* - Control de la navegación (opcional)
* - Control del buscador de calles (opcional)
* - Configuración del mapa (donde se añade el mapa base)
* - Carga del mapa (aquí se añade todo el pintado de datos; https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/)
*/
function initMap(){
    const TOKENPRODUCCION = 'pk.eyJ1IjoiZXJyZWluZm9ncmFwaGljcyIsImEiOiJja3IzOGgwaGwwb3hlMnZwdDl5Mnk1MnB4In0.jqh8JyeTnuDwrhEFIq1Wcg';
    mapboxgl.accessToken = TOKENPRODUCCION;

    /* Inicio de la configuración del mapa */
    map = new mapboxgl.Map({
        attributionControl: false,
        container: 'map',
        zoom: zoom,
        minZoom: minZoom,
        center: center,
        pitch: pitch,
        bearing: bearing,
        style: 'mapbox://styles/erreinfographics/ckr5a8ecc0tn417mi43v1fydh'
    });

    /* Controles en el mapa (https://docs.mapbox.com/mapbox-gl-js/api/markers/) */

    /* Buscador de calles | Muchas más opciones de configuración en https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder/ */
    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            language: 'ES',
            marker: false,
            placeholder: 'Search...',
            collapsed: true
        })
    );



    /* Escala */
    let scale = new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
    });

    /* Navegación */
    let nav = new mapboxgl.NavigationControl();

    map.addControl(scale);
    map.addControl(nav);    

    /* Variable para trabajar con popup/tooltip */
    popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // (EN ESTE EJEMPLO NO ES NECESARIO) Si fuese necesario recoger datos externos, podríamos acceder aquí a tales datos (antes de la carga del mapa)
    // En los casos donde hubiese que hacer un join con los polígonos de Mapbox (mapas de coropletas, p.e.), aquí primero cargamos los datos y, más tarde, hacemos el JOIN una vez cargado el tileset
    // En los casos donde hubiese que recoger un csv y transformarlo en geojson, lo hacemos aquí tras el acceso a los datos (https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#geojson)
    // En los casos donde el mismo acceso fuese un geojson, simplemente debemos cargar los datos como una fuente/tileset externo (https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#geojson)
    
    //Carga del mapa
    map.on('load', () => {

        

        //Añadimos fuentes de datos al mapa (y le damos un nombre para luego usarlo como layer)
       /* map.addSource('barrios', {
            'type': 'vector',
            'url': 'mapbox://erreinfographics.dp9ohao3'
        });*/

        map.addSource('eixample', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4tq9jc0rze20mmfgom6t5o-7iamg'
        });

        map.addSource('gracia', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4ts85u4d592bnzsj68zto4-69smd'
        });

        map.addSource('horta', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4tsxui414g28r5zyu7al5g-7caug'
        });

        map.addSource('lescorts', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4ttcmw056d28o4rvrdptmc-06vp0'
        });

        map.addSource('nouBarris', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4ttpoa0hdr20lexggfwp5m-3v6pd'
        });

        map.addSource('sanAndreu', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4ttz5o11li21mfm4apcerl-7ou6d'
        });

        map.addSource('sants_montjuic', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4tv7r011ci21piz6ofts3k-30jea'
        });

        map.addSource('sanMarti', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4tud0u0h3320o5t1ujpt2u-819jb'
        });

        map.addSource('ciutat_vella', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4todfk0i7s20moo6epvih7-4kci7'
        });

        map.addSource('sarria', {
            'type': 'vector',            
            'url': 'mapbox://erreinfographics.ckr4tw18f412s27r5q64sne9u-0ti5x'
        });


         //Layer > Polígonos barrios
        /*map.addLayer({
            'id': 'barrios_layer',
            'source': 'barrios',
            'source-layer': 'barris_bcn-68km8z',
            'layout': { 'visibility': 'visible' },
            'type': 'line', // 'line o fill'
            'paint': {
                //'fill-color': 'yellow',
                'line-color': '#6d7070',
                'line-width': 2
            }      
        });*/


         //Layers > Círculos airbnb's por barrios
        map.addLayer({
            'id': 'eixample_circulos',
            'source': 'eixample',
            'source-layer': 'eixample_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'gracia_circulos',
            'source': 'gracia',
            'source-layer': 'gracia_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'horta_circulos',
            'source': 'horta',
            'source-layer': 'horta_guinardo_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'lescorts_circulos',
            'source': 'lescorts',
            'source-layer': 'lescorts_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'nouBarris_circulos',
            'source': 'nouBarris',
            'source-layer': 'nouBarris_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'sanAndreu_circulos',
            'source': 'sanAndreu',
            'source-layer': 'sanAndreu_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'sants_montjuic_circulos',
            'source': 'sants_montjuic',
            'source-layer': 'sants_montjuic_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'sanMarti_circulos',
            'source': 'sanMarti',
            'source-layer': 'sanMarti_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'ciutat_vella_circulos',
            'source': 'ciutat_vella',
            'source-layer': 'ciutat_vella_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        map.addLayer({
            'id': 'sarria_circulos',
            'source': 'sarria',
            'source-layer': 'sarria_santGervasi_airbnb',
            'layout': { 'visibility': 'visible' },
            'type': 'circle',
            'paint': {
                'circle-radius': 3.5,
                'circle-color': '#29DDC7',
                'circle-opacity': 0.9

            }
        }, 'road-label');


        //map.moveLayer('poi-label');
        //map.moveLayer('poi-label','country-label');

        // Comunicar al mapa cómo debe funcionar a determinados eventos (https://docs.mapbox.com/mapbox-gl-js/api/handlers/)
        //map.scrollZoom.disable();

        /* 
        * Unir el layer con el elemento popup 
        * - Si tenemos más layers y queremos visualizar info. en el tooltip, debemos
        * - 'bindear' tantos layers como tengamos
        * - Ejemplo: bind_event(popup, 'id_layer');
        */
        bind_event(popup, 'eixample_circulos', 'Eixample');
        bind_event(popup, 'gracia_circulos', 'Gracia');
        bind_event(popup, 'horta_circulos', 'Horta-Guinardó');
        bind_event(popup, 'lescorts_circulos', 'Les Corts');
        bind_event(popup, 'nouBarris_circulos', 'Nou Barris');
        bind_event(popup, 'sanAndreu_circulos', 'Sant Andreu');
        bind_event(popup, 'sants_montjuic_circulos', 'Sants-Montjuïc');
        bind_event(popup, 'sanMarti_circulos', 'Sant Martí');
        bind_event(popup, 'ciutat_vella_circulos', 'Ciutat Vella');
        bind_event(popup, 'sarria_circulos', 'Sarrià-Sant Gervasi');
    });
}

/* EVENTOS Y FUNCIONES DE MODIFICACIÓN DEL MAPA */
/*
* - Los botones HTML se encargarán de lanzar tales eventos
* - Las funciones permiten escuchar esos eventos (clicks en botones, p.e.) y cambiar elementos del mapa
* - Se suelen utilizar expresiones típicas de Mapbox (https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/)
*/
document.getElementById('allHosts').addEventListener('click', function() {
    setallHosts();
});

document.getElementById('firstHost').addEventListener('click', function() {
    setFirstHost();
});

document.getElementById('secondHost').addEventListener('click', function() {
    setSecondHost();
});

document.getElementById('thirdHost').addEventListener('click', function() {
    setThirdHost();
});

function setallHosts() {
    allFilter = true;
    firstFilter = false;
    secFilter = false;
    thirdFilter = false;
    for (let i = 0; i < barriosids.length; i++) {
          //map.setPaintProperty(barriosids[i], 'circle-opacity', 1);
          map.setFilter(barriosids[i]); 
    }  
   
}

function setFirstHost() {
    allFilter = false;
    firstFilter = true;
    secFilter = false;
    thirdFilter = false;
    for (let i = 0; i < barriosids.length; i++) {
           /*map.setPaintProperty(barriosids[i], 'circle-visibility', 
                [
                    'match',
                    ['get', 'host-id'],
                    'airbnb4459553',
                    1,
                    0
                ]            
            ); */
            map.setFilter(barriosids[i], ['==', 'host-id', 'airbnb4459553']); 
    }  
     
}

function setSecondHost() {
    allFilter = false;
    firstFilter = false;
    secFilter = true;
    thirdFilter = false;
    for (let i = 0; i < barriosids.length; i++) {
        map.setFilter(barriosids[i], ['==', 'host-id', 'airbnb102947901']);
      /* map.setPaintProperty(barriosids[i], 'circle-opacity', 
            [
                'match',
                ['get', 'host-id'],
                'airbnb102947901',
                1,
                0
            ]            
         ); */
    }
      
}

function setThirdHost() {
    allFilter = false;
    firstFilter = false;
    secFilter = false;
    thirdFilter = true;
    for (let i = 0; i < barriosids.length; i++) {
        /*map.setPaintProperty(barriosids[i], 'circle-opacity', 
            [
                'match',
                ['get', 'host-id'],
                'airbnb1391607',
                1,
                0
            ]            
        );*/
        map.setFilter(barriosids[i], ['==', 'host-id', 'airbnb1391607']);   
    }    
}

/* TOOLTIP */
/*
* - Configuración del tooltip (posicionamiento del tooltip e información a utilizar)
* - Escribir información -en HTML- en el tooltip
*/

/* En el layout específico (con id) cuando el ratón se mueva por el mapa en un elemento en concreto, que nos muestre un popup */
function bind_event(popup, id, nameBarrio){
    map.on('mousemove', id, function(e){
        let props = e.features[0].properties; //Propiedades que ya venían en el mapa cuando se ha subido al servidor de Mapbox (es decir, columnas del tileset)
        let state = e.features[0].state; // Propiedades que sólo aparecen si hemos hecho JOIN con datos externos
        
        map.getCanvas().style.cursor = 'pointer';
        var coordinates = e.lngLat;        
        var tooltipText = get_tooltip_text(id, nameBarrio, props, state); //Recogida del texto para mostrar en el popup de Mapbox
        console.log(props);
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates)
            .setHTML(tooltipText)
            .addTo(map); 

        if(allFilter == true){
            for (let i = 0; i < barriosids.length; i++) {
                if(id == barriosids[i]){
                    map.setPaintProperty(barriosids[i], 'circle-opacity', 1);
                }else{
                    map.setPaintProperty(barriosids[i], 'circle-opacity', 0.1);
                }
            }  
        }  
    });
    map.on('mouseleave', id, function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
        if(allFilter == true){
            for (let i = 0; i < barriosids.length; i++) {
                 map.setPaintProperty(barriosids[i], 'circle-opacity', 1);
            } 
        } 
    });
}

/* Ejemplo de pintado de texto en tooltip con información distinta para dos capas */
function get_tooltip_text(id, nameBarrio, props, state){
    let html = `<div class=popup-content">`;

    //if(id == 'eixample_circulos') {
    html += '<h1>' + nameBarrio + '</h1><p>'+ 'HOST: ' + props["host-id"] +'</p><p>'+ 'CAPACITY: ' + props["capacity"] +'</p><p>'+ 'PRICE: ' + props["price"] +'€</p>';
    //}

    //html += '</div>'

    return html;
               
}

/* HELPERS */
/*
* - Funciones que nos ayudan a mejorar la calidad, legibilidad del código o a transformar información 
*/
function getNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}