$(document).ready(function () {
    var zindex = 10;

    $("#NoData").hide()
    card = (id) => {

        var isShowing = false;

        if ($('#' + id + '').hasClass("show")) {
            isShowing = true
        }

        if ($("div.cardds").hasClass("showing")) {
            // a cardd is already in view
            $("div.cardd.show")
                .removeClass("show");

            if (isShowing) {
                // this cardd was showing - reset the grid
                $("div.cardds")
                    .removeClass("showing");
            } else {
                // this cardd isn't showing - get in with it
                $('#' + id + '')
                    .css({ zIndex: zindex })
                    .addClass("show");

            }

            zindex++;

        } else {
            // no cardds in view
            $("div.cardds")
                .addClass("showing");
            $('#' + id + '')
                .css({ zIndex: zindex })
                .addClass("show");

            zindex++;
        }

    };
});


// Función para cargar información de pasajeros al hacer hover
load_Pas = (Id_Reserva) => {
    fetch('/VerRervas/Pasajeros?Id_Reserva=' + Id_Reserva + '').then(function (response) {
        return response.json();
    }).then(function (responseData) {
        var html = '<h4>Pasajeros</h4>';
        html += '<table class="table table-dark table-striped table-hover">';
        html += '<thead>';
        html += '<th>Nombre</th>';
        html += '<th>Identificacion</th>';
        html += '</thead>';
        html += '<tbody>';
        if (responseData.length > 0) {
            for (var count = 0; count < responseData.length; count++) {
                html += '<tr>';
                html += '<td>';
                html += responseData[count].NombrePasajero;
                html += '</td>';
                html += '<td>';
                html += responseData[count].IdPas;
                html += '</td>';
                html += '</tr>';
            }
        }
        html += '</tbody>';
        html += '</table>';
        $(".pasajeros").html(html);
    });
};

Filtro = (selectionTour = '', FechaReserva = '', FechaRegistro = '', CategoriaReserva = '', Id_Reserva = '', IdPas = '', Empty = '', NombreApellido = '') => {
    fetch('/VerReservas/FiltroVerReservas?selectionTour=' + selectionTour + '&FechaReserva=' + FechaReserva + '&FechaRegistro=' + FechaRegistro + '&CategoriaReserva=' + CategoriaReserva + '&Id_Reserva=' + Id_Reserva + '&IdPas=' + IdPas + '&Empty=' + Empty + '&NombreApellido=' + NombreApellido + '').then(function (response) {
        return response.json();
    }).then(function (responseData) {
        var cardContainer = document.getElementById("cardContainer");

        // Limpiar contenido existente en el contenedor
        cardContainer.innerHTML = '';

        if (responseData.length > 0) {
            $("#NoData").hide();

            responseData.forEach(function (Reserva) {
                var cardHTML = `
<div class="card-wrapper col-12 mb-3" id="${Reserva.Id_Reserva}" onmouseover="load_Pas('${Reserva.Id_Reserva}')">
    <div class="card-details">
                    <h3 class="card-title">${Reserva.Id_Reserva} 
                        ${(Reserva.TipoReserva == "Privada") ? '<i class="bx bxs-lock-alt"></i>' : ''}
                    </h3>
                </div><!-- end card-details -->
                <br>
                <div class="reveal-details">
                    <!-- Agrega aquí contenido adicional según sea necesario -->
                    <p>Fecha del Tour: ${Reserva.FechaReserva}</p>
                    <p>Ruta: ${Reserva.Ruta}</p>
                    <p>Número de Pasajeros: ${Reserva.NumeroPasajeros}</p>
                    <p>Tour: ${Reserva.NombreTour}</p>
                    <p>Fecha de registro: ${Reserva.FechaRegistro}</p>
                    <p>Telefono Reserva: ${Reserva.TelefonoReserva}</p>
                    <div class="pasajeros"></div>
                </div><!-- end reveal-details -->
    <div class="cardd-flap flap2">
        <div class="cardd-actions">
            <a class="pdf" onclick="PDF('${Reserva.Id_Reserva}');">
                <iconify-icon icon="material-symbols:download" style="color: white;" width="30" height="30"></iconify-icon>
            </a>
            <a href="../Reservas/EditarReserva/${Reserva.Id_Reserva}" class="edit">
                <iconify-icon icon="material-symbols:edit" style="color: white;" width="30" height="30"></iconify-icon>
            </a>
            <a type="button" class="delete" id="delete${Reserva.Id_Reserva}">
                <iconify-icon icon="material-symbols:delete-outline" style="color: white;" width="30" height="30"></iconify-icon>
            </a>
        </div>
    </div>
</div><!-- end card-wrapper -->
<script type="text/javascript>
$("#delete${Reserva.Id_Reserva}").click(() => {
    swal({
        title: "¿Seguro desea eliminar la reserva ${Reserva.Id_Reserva}?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((go) => {
        if (go) {
            deleteReserva('${Reserva.Id_Reserva}')
        }
    });
});
</script>`;
                document.body.appendChild(deleteScript);
            });
        } else {
            $("#NoData").show();
        }
    });
}

$("#filtrar").click(function () {
    var tour = $('#tour').val();
    var FechaReserva = $('#FechaReserva').val();
    var FechaRegistro = $('#FechaRegistro').val();
    var CategoriaReserva = $('#CategoriaReserva').val();
    var Id_Reserva = $('#Id_Reserva').val();
    var IdPas = $('#IdPas').val();
    var NombreApellido = $('#NombreApellido').val();
    var Empty = '';
    $("#empty").each(function () {
        if ($(this).is(":checked")) {
            Empty = $(this).val();
        }
    })
    if ((tour != '') || (FechaReserva != '') || (FechaRegistro != '') || (CategoriaReserva != '') || (Id_Reserva != '') || (IdPas != '') || (Empty != '') || (NombreApellido != '')) {
        Filtro(tour, FechaReserva, FechaRegistro, CategoriaReserva, Id_Reserva, IdPas, Empty, NombreApellido);
    }
});
$("#deshacer").click(function () {
    $(".cardd").show();
    $("#NoData").hide();
});


function PDF(Id_Reserva) {
    var cardElement = document.getElementById(Id_Reserva);

    // Ajusta el tamaño de la tarjeta para que abarque toda la pantalla
    cardElement.classList.add('pdf');
    $('.cardd-actions').hide();

    // Genera el PDF con html2pdf y establece el nombre del archivo
    html2pdf(cardElement, {
        filename: Id_Reserva,  // Cambia 'nombre_del_archivo' por el nombre deseado
    }).then(() => {
        cardElement.classList.remove('pdf');
        $('.cardd-actions').show();
    });
}





deleteReserva = (Id_Reserva) => {
    fetch('/Reservas/DeleteReserva?Id_Reserva=' + Id_Reserva + '').then(response => {
        response.json();
    }).then((res) => {
        if (res == 'error') {
            swal({
                title: "Ocurrió un error",
                text: "No fue posible eliminar la reserva, Si el error continúa, comuníquese con soporte técnico.",
                icon: "error",
                buttons: true,
                dangerMode: true,
            })
        } else {
            swal({
                text: "La reserva se ha eliminado correctamente.",
                icon: "success",
                buttons: true,
                dangerMode: true,
            }).then(() => {
                $('#' + Id_Reserva + '').remove();
                $("div.cardds").addClass("showing");
            })

        }
    })
}
