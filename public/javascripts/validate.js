$(document).ready(function() {
    $.validator.addMethod("startsWithLetter", function(value, element) {
      return this.optional(element) || /^[A-Za-z]/.test(value);
    }, "Name must start with a letter.");
  
    $("#usersignupform").validate({
      rules: {
        Name: {
          required: true,
          startsWithLetter: true,
        },
        Email: {
          required: true,
          email: true,
        },
        Password: {
          required: true,
        }
      }
    });
    $("#sell").validate({
        rules: {
          pname: {
            required: true,
          },
          age: {
            required: true,
          },
          price: {
            required: true,
          },
          place:
          {
            required:true
          },
          discription:
          {
            required:true
          },
          kcl:
          {
            required:true
          },address:
          {
            required:true
          },
          phno:
          {
            required:true,
            minlength: 10,
            maxlength : 10,
          },
          image1:
          {
            required:true
          }
        }
      });
  });
  