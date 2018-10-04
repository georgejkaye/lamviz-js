var input = document.getElementById('input');

input.addEventListener("keyup", function(event){
    event.preventDefault();
    if(event.keyCode === 13){
        document.getElementById("execute-btn").click();
    }
})