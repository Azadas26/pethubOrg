function addTocart(proId){
    $.ajax({
        url: '/cart?id='+proId,
        method: 'get',
        success: (responce) => {
           if(responce.status)
           {
             var cart=$('#cartnum').html()
             cart=parseInt(cart)+1
               $('#cartnum').html(cart)
           }
        }
    })
}