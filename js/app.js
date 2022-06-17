const selector = (tag)=>{
    return document.querySelector(tag)
};
const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api'
})
const containerCards = selector('.tarea_mostrar_cards');




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
                    <input type="checkbox" id="${sub.id}" class="mx-2 checkDone"> ${sub.nombre} <div class="d-flex"><button id="btnEdit" onclick="editarSub(${item.id}, ${sub.id})" class="btn btn-info btn-sm mx-2"> edit</button>
                    <button  onclick="eliminarSub(${sub.id})" class="btn btn-danger btn-sm">bo</button></div> </li>`).flat().join('')}
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

const subIsDone = async (e)=>{
   let padre = e.target.parentElement;
   let list = padre.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
   list.classList.add('disabled');
   let subid = padre.parentElement.id;
   console.log(e.target.id);
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


const printError = (err, tag) => {
  let alerta= selector(tag);
  alerta.innerText = err;
  alerta.classList.remove('d-none');
  setTimeout(function(){
    alerta.classList.add('d-none')
  }, 5000);
}
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
