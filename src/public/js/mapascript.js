document.getElementById('button').addEventListener("click", function() {
	document.querySelector('.modal').style.display = "flex";
});

document.getElementById('buttonclose').addEventListener("click", function() {
	document.querySelector('.modal').style.display = "none";
});

document.querySelector('.close').addEventListener("click", function() {
	document.querySelector('.modal').style.display = "none";
});

document.getElementById('button0').addEventListener("click", function() {
  document.getElementById('ModalNamerica').style.display = "flex";
});

document.getElementById('button1').addEventListener("click", function() {
  document.getElementById('ModalNamerica').style.display = "flex";
});

document.getElementById('button2').addEventListener("click", function() {
	document.getElementById('ModalNamerica').style.display = "flex";
});

document.getElementById('button3').addEventListener("click", function() {
	document.getElementById('ModalNamerica').style.display = "flex";
});
document.getElementById('button4').addEventListener("click", function() {
	document.getElementById('ModalNamerica').style.display = "flex";
});
document.getElementById('button5').addEventListener("click", function() {
	document.getElementById('ModalNamerica').style.display = "flex";
});

document.getElementById('adminpanel').addEventListener("click", function() {
	document.getElementById('adminPanel').style.display = "flex";
});
document.getElementById('buttoncloseAdmin').addEventListener("click", function() {
	document.getElementById('adminPanel').style.display = "none";
});

document.getElementById('buttoncloseN').addEventListener("click", function() {
	document.getElementById('ModalNamerica').style.display = "none";
});

// Periodico
document.getElementById('periodicoButt').addEventListener("click", function() {
	document.getElementById('periodicoM').style.display = "flex";
});

document.getElementById('buttonclosePeriodico').addEventListener("click", function() {
	document.getElementById('periodicoM').style.display = "none";
});


  var cartas = 0; 
  var cartaId = 0;
  var año = 1800;

  var cards = [
    //Defensa
  { name: "Anti-Misiles", precio: 200, img: "CartaPrueba.png", cantidad: 0},
  { name: "Defensa Militar", precio: 100, img: "CartaPrueba.png", cantidad: 0},
  { name: "Barricadas", precio: 100, img: "CartaPrueba.png", cantidad: 0},
  { name: "Firewall", precio: 100, img: "CartaPrueba.png", cantidad: 0},
  { name: "Equipo de Ciberseguridad", precio: 100, img: "CartaPrueba.png", cantidad: 0},
  { name: "Desactivar la Red", precio: 100, img: "CartaPrueba.png", cantidad: 0},
  //Ataque
  { name: "Ataque Aéreo", precio: 200, img: "CartaPrueba.svg", cantidad: 0},
  { name: "Ataque Terrestre", precio: 100, img: "CartaPrueba.svg", cantidad: 0},
  { name: "Ataque Aliado", precio: 100, img: "CartaPrueba.svg", cantidad: 0},
  { name: "Ataque de Phishing", precio: 100, img: "CartaPrueba.svg", cantidad: 0},
  { name: "Ingeniería social", precio: 100, img: "CartaPrueba.svg", cantidad: 0},
  { name: "Ataque de Bot net", precio: 100, img: "CartaPrueba.svg", cantidad: 0},
  { name: "Ataque Spoofing", precio: 100, img: "CartaPrueba.svg", cantidad: 0},
  { name: "Ataque DDOS", precio: 100, img: "CartaPrueba.svg", cantidad: 0}
  
  ];



function cargarCantidad(cartaId){
  let cartasguard = JSON.parse(localStorage.cartasguard);
  document.getElementById("cantidadCartas0").innerHTML = "Cantidad: "+ cartasguard[cartaId].cantidad;
  document.getElementById("tituloCarta").innerHTML = cartasguard[cartaId].name;
  document.getElementById("imgCarta").innerHTML = " <img src="+ cards[cartaId].img +"> ";

  if(cartasguard[cartaId].cantidad > 0){
    document.getElementById("botonCartas0").innerHTML = "<p>Precio:  "+ cartasguard[cartaId].precio + " <img src='assets/img/Oro.png' width='20px'></p><button type='button' class='btn btn-success'onclick=' usarCarta("+cartaId+");' data-dismiss='modal'>Usar</button> <button type='button' class='btn btn-warning' onclick='comprarCarta("+cartaId+");' data-dismiss='modal'>Comprar</button>";
  }else{
    document.getElementById("botonCartas0").innerHTML = "<p>Precio:  "+ cartasguard[cartaId].precio +" <img src='assets/img/Oro.png' width='20px'></p><button type='button' class='btn btn-warning' onclick='comprarCarta("+cartaId+");' data-dismiss='modal'>Comprar</button>";
  }
}


function random_card() {
  let cartasguard = JSON.parse(localStorage.cartasguard);
  cargarVariables();
while (cartas <= 13) {
    const card= cartasguard[cartas];
    const imgSrc = cards[cartas].img;

    cartaId = cartas;

    const html = "<a href='#'><img src='"+ imgSrc + "'data-toggle='modal' onclick='cargarCantidad("+cartaId+");' data-target='#modalCarta"+0+"'"+"/></a>";
    // ... hacer algo con la url, quizá añadir un <img> en el div?
    document.getElementById("myDiv").innerHTML += html;
    cartas++;
    random_card();
}
// if(cartas = 5){
//   cargarAtaques();
// }
}


function comprarCarta(cartaId){
    let micontinente = JSON.parse(localStorage.micontinente);
    let cartasguard = JSON.parse(localStorage.cartasguard);

    let OroDisp = micontinente[continenteId].Oro;
    let cartaPrecio = cartasguard[cartaId].precio;
    let compra = OroDisp - cartaPrecio;

    if(micontinente[continenteId].Oro >= cartasguard[cartaId].precio){
        compra;
        micontinente[continenteId].Oro = compra;
        cartasguard[cartaId].cantidad++;
        alert("Carta: "+ cartasguard[cartaId].name +" comprada con exito. ");
    }else{
      alert("No tienes suficiente Oro para comprar la Carta, tienes: " + micontinente[continenteId].Oro + " de oro.");
    }
    localStorage.micontinente = JSON.stringify(micontinente);
    localStorage.cartasguard = JSON.stringify(cartasguard);
}

function usarCarta(cartaId){
  let cartasguard = JSON.parse(localStorage.cartasguard);

  if(cartasguard[cartaId].cantidad > 0){
    cartasguard[cartaId].cantidad--;
    alert("Has usado la carta: "+cartasguard[cartaId].name);
  }else{
    alert("No te quedan cartas de: "+cartasguard[cartaId].name)
  }
  localStorage.cartasguard = JSON.stringify(cartasguard);
}
