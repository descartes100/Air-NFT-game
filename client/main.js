Moralis.initialize(""); // Application id from moralis.io
Moralis.serverURL = ""; //Server url from moralis.io
const CONTRACT_ADDRESS = "";

async function init() {
    try {
        let user = Moralis.User.current();
        // if (!user) {
            $("#login_button").click(async()=>{
                user = await Moralis.Web3.authenticate();
            })
        // }
        renderGame();
        
    } catch (error) {
        console.log(error);
    }
}

async function renderGame(){
    // $("#login_button").hide();
    $("#pet_row").html("");
    //get and render properties from SC
    let petId = 0;
    window.web3 = await Moralis.Web3.enable();
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi,CONTRACT_ADDRESS);
    let array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    if (array.length ==0) return;
    array.forEach(async petId => {
        let details = await contract.methods.getTokenDetails(petId).call({from: ethereum.selectedAddress});
        renderPet(petId, details);
    })
    
    $("#game").show();
}

function renderPet(id,data){
    let now = new Date();
    let maxTime =data.endurance;
    let currentUnix = Math.floor(now.getTime()/1000);
    let secondsLeft = (parseInt(data.lastMeal)+parseInt(data.endurance))-currentUnix;
    let percentageLeft = secondsLeft/maxTime;
    let percentageString = (percentageLeft*100)+'%';

    let interval = setInterval(() => {
        let now = new Date();
        let maxTime =data.endurance;
        let currentUnix = Math.floor(now.getTime()/1000);
        let secondsLeft = (parseInt(data.lastMeal)+parseInt(data.endurance))-currentUnix;
        let percentageLeft = secondsLeft/maxTime;
        let percentageString = (percentageLeft*100)+'%';
        $(`#pet_${id}.progress-bar`).css("width",percentageString);
        if (percentageLeft<0) {
            clearInterval(interval);
        }
    },5000)

    let deathTime = new Date((parseInt(data.lastMeal)+parseInt(data.endurance))*1000);
    if (now>deathTime){
        deathTime = "<b>DEAD</b>"
    }
    let htmlString =`
    <div class="col-md-3 card mx-1" id="pet_${id}">
      <img class="card-img-top pet_img" src="pet.png" >
      <div class="card-body">
        <div>Id: <span class="pet_id">${id}</span></div>
        <div>Damage: <span class="pet_damage">${data.damage}</span></div>
        <div>Magic: <span class="pet_magic">${data.magic}</span></div>
        <div>Endurance: <span class="pet_endurance">${data.endurance}</span></div>
        <div class="progress">
           <div class="progress-bar" style="width: ${percentageString};">
           </div>
        </div>
        <button data-pet-id="${id}"  class="feed_button btn btn-primary btn-blocks">Feed</button>
      </div>
    </div>`;

    let element = $.parseHTML(htmlString);
    $("#pet_row").append(element);
    
    $(`#pet_${id} .feed_button`).click( ()=> {
        feed(id);
    })
}

function getAbi(){
    return new Promise( (res)=>{
        $.getJSON("Token.json",((json) =>{
            res(json.abi);
        }))
    })
}

async function feed(petId){
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi,CONTRACT_ADDRESS);
    contract.methods.feed(petId).send({from: ethereum.selectedAddress}).on("receipt",(()=>{
        console.log("done");
        renderGame();
    }))
}

init();