$(document).ready(function () {
    $('#card').click(function () {
        $('#paycard').show(1000)
        $('#imgs').hide(1000)
    })
    $('#upi').click(function () {

        $('#imgs').show(1000)
        $('#paycard').hide(1000)
    })

})