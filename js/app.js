const selector = (tag)=>{
    return document.querySelector(tag)
};
const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api'
})
const containerCards = selector('.tarea_mostrar_cards');


/**
 * 
 * Metodo para pedir a la base de datos todas las listas de tareas y renderizarlas
 */

const getAll = async ()=>{
    let {data} = await axiosClient.get("/tarea");
    
    data.forEach(item=>{
        let card = document.createElement("div"); 
        card.innerHTML =
        `           
            <div class="card-body">
               <h5 class="card-title text-end">${item.titulo}</h5>
               <div class="input-group">
                   <button class="btn btn-outline-success btn-sm" type="button" onclick="crearNuevaSub(${item.id})" >
                     Agregar
                   </button>
                   <input
                     type="text"
                     id="nuevaSub${item.id}"
                     class="form-control"
                     placeholder="Nueva tarea"
                     aria-label="Nueva tarea"
                     name=""
                   />                  
                 </div>
                 <p class="text-danger errSub${item.id}"></p>
                 </div>
                 <ul class="list-group list-group-flush" id="${item.id}">
                    ${item.subtareas.map(sub=> `<li  class="list-group-item d-flex flex-nowrap justify-content-between align-items-center list${sub.id}">
                    <input ${sub.subdone? 'checked' : 'unchecked'} type="checkbox" id="${sub.id}" class="mx-2 checkDone"> ${sub.nombre} <div class="d-flex"><button title="Editar subtarea" id="btnEdit" onclick="editarSub(${item.id}, ${sub.id})"  class="${sub.subdone? "btn btn-info btn-sm mx-2 disabled" : "btn btn-info btn-sm mx-2"}"> <span class="material-icons">
                    edit_calendar
                    </span></button>
                    <button title="Eliminar subtarea" onclick="eliminarSub(${sub.id})" class="btn btn-danger btn-sm"><span class="material-icons">delete_forever</span></button></div> </li>`).flat().join('')}
                 </ul>
                 <div class="card-body">
                   <button onclick="eliminarTarea(${item.id})" class="card-link btn btn-info btn-sm ">borrar</button>
                   
                   <button onclick="editarTarea(${item.id})" class="card-link btn btn-warning btn-sm">editar</button>
                 </div>
                 </div>
                 </div>`;
            

            
            card.classList.add('card', 'm-2');
            containerCards.append(card);
            
           console.log(item.subtareas)
        })

  
}
getAll()


/**
 * Metodo para crear una nueva lista de tareas, contiene las peticiones post y put. Segun si sea nueva o se este editando una.
 */
const crearNuevaTarea= async ()=>{
  
  let title = selector("#NuevaTarea");
  let body = {};
  let error = validate(title.value);
  if(error === ""){  
   body = {
    "titulo": title.value,
  }
  try{
    if(title.name === ""){
      let response = await axiosClient.post('/tarea', body);
      setTimeout(()=>{
       location.reload()

      }, 2000)}else{
      
       let response = await axiosClient.put(`/tarea/${title.name}`, body);
       setTimeout(()=>{
       location.reload()

      }, 2000)}
  }catch(e){
    printError(e.message, "#alert");
  }}else{
    printError(error, "#alert")

  }

 
}

/**
 * Metodo para crear una nueva subtarea, contiene las peticiones post y put. Segun si sea nueva o se este editando una.
 */
const crearNuevaSub = async (id)=>{
    let nombre = selector(`#nuevaSub${id}`);
    let body = {};
    let error = validate(nombre.value);
     if(error === ""){        
        body = {
          "nombre": nombre.value,
	        "tarea":{
		          "id": id
              }}
    try{
      if(nombre.name === ""){
       let response = await axiosClient.post('/subtarea', body);
       setTimeout(()=>{
        location.reload()

       }, 2000)}else{
       
        let response = await axiosClient.put(`/subtarea/${nombre.name}`, body);
        setTimeout(()=>{
        location.reload()

       }, 2000)}
    }catch(e){
    printError(e.message, `.errSub${id}`);
    }}else{
    printError(error, `.errSub${id}`)

    }
   
    
}
/**
 * Seleccionamos una subtarea para que se pueda editar, se envia al formulario y con el metodo crear se hace la peticion de actualizar.
 * @param {*} id  id de la lista padre.
 * @param {*} id2  id de la subtarea.
 */
const editarSub =  async (id, id2) => {
  
  let nombre = selector(`#nuevaSub${id}`);
  try
  {const {data} = await axiosClient.get("/subtarea");
    data.forEach(item =>{
    if(item.id === id2){
      nombre.value = item.nombre;
      nombre.name = item.id;
    }
  })}catch(e) {
    printError(e.message, `.errSub${id}`);
  }
    console.log(nombre); 
  }

  /**
   * Eliminamos una subtarea segun su id.
   * @param {*} id  id de la subtarea.
   */
const eliminarSub = async (id) => {
  
  let opcion =  confirm(`Estas seguro de eliminar la tarea`)
  if(opcion){
    try {
      let response = await axiosClient.delete(`/subtarea/${id}`);
      alert(response.data);
      location.reload();
    } catch (error) {
      alert(error.message);
    }
  }
}

/**
 * Eliminamos una lista de tareas completa, por su id.
 * @param {*} id  de la lista.
 */
const eliminarTarea = async (id) => {
  
  let opcion =  confirm(`Estas seguro de eliminar la lista de tareas`)
  if(opcion){
    try {
      let response = await axiosClient.delete(`/tarea/${id}`);
      alert(response.data);
      location.reload();
    } catch (error) {
      alert(error.message);
    }
  }
}

/**
 * 
 * Seleccionamos una lista de tareas para que se pueda editar su nombre, se envia al formulario y con el metodo crear se hace la peticion de actualizar.

 */
 
const editarTarea = async (id) => {
  let nombre = selector(`#NuevaTarea`);
  try
  {const {data} = await axiosClient.get("/tarea");
    data.forEach(el =>{
    if(el.id === id){
      nombre.value = el.titulo;
      nombre.name = el.id
    }
  })}catch(e) {
    printError(e.message, `.errSub${id}`);
  }
    console.log(nombre); 
  }

  /**
   * Metodo para colocar una subtarea como finalizada, deshabilita el boton editar y permanece en ese estado hasta que se elimine. 
   * @param {*} e evento.
   */
const subIsDone = async (e)=>{
   let padre = e.target.parentElement;
   let list = padre.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
   list.classList.add('disabled');
   let subid = padre.parentElement.id;
   console.log(e.target.checked);
   try {
      let {data} = await axiosClient.get(`/subtarea/${e.target.id}`);
      let body =  {
        "nombre": data.nombre,
        "tarea":{
           "id": subid,
          },
        "subdone": true};
        let response = await axiosClient.put(`/subtarea/${e.target.id}`, body);
   } catch (error) {
     alert(error.message);
   }

}
document.addEventListener("change", subIsDone) ; 

/**
 * Metodo helper para poder mostrar una serie de errores en pantalla, debajo de cada formulario.
 * @param {*} err string del error.
 * @param {*} tag estiqueta html del elemento donde se va a mostrar el error.
 */
const printError = (err, tag) => {
  let alerta= selector(tag);
  alerta.innerText = err;
  alerta.classList.remove('d-none');
  setTimeout(function(){
    alerta.classList.add('d-none')
  }, 5000);
}

/**
 * Metodo helper para ayudarnos a validar los inputs de formularios, admite solo letras y numeros, tamanio entre 3 y 30 caracteres.
 * @param {*} value es el valor del input a validar.
 * @returns nos regresa el error del momento segun que validacion haga. 
 */
const validate = (value)=>{
  let error = "";
  
   if(value.length <= 2 ){
     error = "Ingresa mas de 2 letras";
   }else if(!/^[a-zA-Z0-9]{2,}$/i.test(value.split(" ").join(""))){
    error = "Solo se permiten letras y numeros"
   }else if(value.length > 30){
    error = "Solo se permite hasta 30 caracteres"
   }
   return error
}
