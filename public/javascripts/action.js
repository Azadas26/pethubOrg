$(document).ready(function () {
    $('#card').click(function () {
        $('#paycard').show(1000)
        $('#imgs').hide(1000)
    })
    $('#upi').click(function () {

        $('#imgs').show(1000)
        $('#paycard').hide(1000)
    })

    $('#b1').click(function()
    {
        $('#img1').show(1000)
        $('#img2').hide(1000)
        $('#img3').hide(1000)
    })
    $('#b2').click(function () {

        $('#img2').show(1000)
        $('#img1').hide(1000)
        $('#img3').hide(1000)
        
    })
    $('#b3').click(function () {
       
        $('#img3').show(1000)
        $('#img1').hide(1000)
        $('#img2').hide(1000)
    })

})