var miesto_buff = null;

function OnSeat_click(miesto) {
  if (g_performance.Resale.Seats[miesto[0]] != null) {
    if (isnull(g_performance.Resale.Seats[miesto[0]].Token) == false) {
      var pocet = 0;
      var cena = 0;
      var token = g_performance.Resale.Seats[miesto[0]].Token;

      for (var i in g_performance.Resale.Seats) {
        console.log(g_performance.Resale.Seats[i]);
        if (
          isnull(g_performance.Resale.Seats[i].Token) == false &&
          g_performance.Resale.Seats[i].Token == token
        ) {
          pocet += 1;
          cena +=
            g_performance.Resale.Seats[i].Cena +
            g_performance.Resale.Seats[i].Poplatok;
        }
      }

      $("#resaleModal-body").addClass("hidden");
      $("#resaleModal-body-balicek").removeClass("hidden");
      $("#resaleModal-btn-primary").addClass("hidden");
      $("#resaleModal-btn-confirm").removeClass("hidden");
      $("#resaleModal-btn-close").removeClass("hidden");

      $("#resaleModal-pocet").html(pocet);
      $("#resaleModal-cena").html(Format_mena(cena));
      $("#resaleModal").modal("show");
      miesto_buff = miesto;
      return;
    } else {
      $("#resaleModal-body").removeClass("hidden");
      $("#resaleModal-body-balicek").addClass("hidden");
      $("#resaleModal-btn-primary").removeClass("hidden");
      $("#resaleModal-btn-confirm").addClass("hidden");
      $("#resaleModal-btn-close").addClass("hidden");

      if (typeof localStorage != null) {
        if (localStorage.getItem("dontShowResaleWarningModal") == null) {
          $("#resaleModal").modal("show");
          miesto_buff = miesto;
          return;
        }
      }
    }
  }

  if (typeof oznacene[miesto[0]] != "undefined" && oznacene[miesto[0]] == 1) {
    OdznacMiesto(miesto[0]);
  } else {
    OznacMiesto(miesto[0]);
  }
}

function handleModalAcknowledgement() {
  if (document.getElementById("dontShowAgain").checked) {
    localStorage.setItem("dontShowResaleWarningModal", "true");
  }
  $("#resaleModal").modal("hide");

  var miesto = miesto_buff;
  if (typeof oznacene[miesto[0]] != "undefined" && oznacene[miesto[0]] == 1) {
    OdznacMiesto(miesto[0]);
  } else {
    OznacMiesto(miesto[0]);
  }
}

function handleModalAcknowledgement_close() {
  $("#resaleModal").modal("hide");
}

var vip_kat = null;
var posledne_pridane_miesto = null;
function ZrusitPosledneMiesto() {
  OdznacMiesto(posledne_pridane_miesto);
  $("#rootPopisMiesta").css("display", "none");
}

function OznacMiesto(miesto) {
  posledne_pridane_miesto = miesto;
  // Kontrola priority pred oznacenim miesta
  var pocet_predstavenie = 0;
  if (
    typeof minSeatCount != "undefined" &&
    typeof maxSeatCount != "undefined"
  ) {
    for (var i in Basket[g_performance.ID]) {
      if (Basket[g_performance.ID].hasOwnProperty(i)) {
        var item = Basket[g_performance.ID][i];
        if (item.id_predstavenie == g_performance.ID) {
          pocet_predstavenie++;
        }
      }
    }

    if (maxSeatCount != null && pocet_predstavenie >= maxSeatCount) {
      var t = $("<textarea />")
        .html(lang["PerformanceDovolene"].replace("#count#", "" + maxSeatCount))
        .text();
      alert(t);

      //alert(lang["PerformanceDovolene"].replace("#count#", "" + maxSeatCount));
      return;
    }
  }

  var id_kategoria = m_all[miesto][3];
  var vip_kat = g_performance.PriceCategories[id_kategoria];
  if (vip_kat.MaxCount < 1) {
    alert(lang["vip_max_pocet_hladisko"].replace("{kategoria}", vip_kat.Name));
    return;
  }

  if (typeof __pp_prednostny == "undefined" || __pp_prednostny == null)
    __pp_prednostny = false;

  let addseatsurl =
    absoluteUri +
    "Event/AddSeats/" +
    g_performance.ID +
    "/" +
    miesto +
    "?ug=" +
    user_guid +
    "&pppred=" +
    __pp_prednostny;
  if (window["upgrade_guid"] != null)
    addseatsurl += "&pmuc=" + window["upgrade_guid"];

  $.ajax({
    url: addseatsurl,
    cache: false,
    statusCode: {
      404: function () {
        alert("Page not found.");
      },
      500: function () {
        alert("Internal server error.");
      },
    },
  }).done(function (data) {
    if (data.Succeeded) {
      if (data.ReturnedObject.Succeeded) {
        vip_kat.MaxCount -= 1;
        ReloadBasket(data.ReturnedObject.Basket);

        var cena =
          data.ReturnedObject.Basket.items[
            data.ReturnedObject.ID_Miesto_Predstavenie
          ].Cena;
        var mena =
          lokalita == "sk"
            ? "EUR"
            : lokalita == "cz"
            ? "CZK"
            : lokalita == "pl"
            ? "PLN"
            : "HUF";
        if (typeof fbq != "undefined") {
          fbq("track", "AddToCart", {
            content_name: g_performance.EventName,
            //content_category: 'Apparel & Accessories > Shoes',
            content_ids: [g_performance.Event.EventOut.ID_Out],
            content_type: "product",
            value: cena,
            currency: mena,
          });
        }

        // fbq('track', 'AddToCart', { content_name 'value': cena, 'currency': mena });

        pocet_predstavenie = 0;
        var cena_predstavenie = 0;
        var pocet_celkom = 0;

        for (var i in data.ReturnedObject.Basket.items) {
          if (data.ReturnedObject.Basket.items.hasOwnProperty(i)) {
            var item = data.ReturnedObject.Basket.items[i];

            if (item.ID_Predstavenie == g_performance.ID) {
              pocet_predstavenie++;
              cena_predstavenie += item.Cena;

              for (var ii in data.ReturnedObject.Basket.items) {
                if (data.ReturnedObject.Basket.items.hasOwnProperty(ii)) {
                  var item2 = data.ReturnedObject.Basket.items[ii];
                  if (item2.BelongsTo == item.ID_Miesto) {
                    cena_predstavenie += item2.Cena;
                    pocet_predstavenie++;
                  }
                }
              }
            }
            pocet_celkom++;
          }
        }

        cena_predstavenie = Math.floor(cena_predstavenie * 100) / 100;

        // Priority kontrola
        if (
          typeof minSeatCount != "undefined" &&
          typeof maxSeatCount != "undefined"
        ) {
          ok = true;

          if (minSeatCount != null && pocet_predstavenie < minSeatCount)
            ok = false;

          if (maxSeatCount != null && pocet_predstavenie > maxSeatCount)
            ok = false;

          if (ok) {
            $("#hladisko-basket-btn").removeAttr("disabled");
            if ($("#modal_hladisko_priority_msg").length != 0)
              $("#modal_hladisko_priority_msg")[0].style.color = "green";
          } else {
            $("#hladisko-basket-btn").attr("disabled", "disabled");
            if ($("#modal_hladisko_priority_msg").length != 0)
              $("#modal_hladisko_priority_msg")[0].style.color = "red";
          }
        }
        //

        if (is_mobile || QueryString["fb"] == "" || getDocWidth() < 768) {
          var $infoKosik = $(".kosik-box");
          var $vyberPocetVst = $(".vyber-pocet-vst");

          if (pocet_celkom > 0) {
            if ($infoKosik.hasClass("hidden")) {
              $infoKosik
                .removeClass("hidden")
                .removeClass($vyberPocetVst)
                .addClass("animated " + animationNameKosik)
                .one(animationEnd, function () {});
            }
          } else {
            if (!$infoKosik.hasClass("hidden")) $infoKosik.addClass("hidden");
          }

          $("#hladisko_basket_2").html(
            "<i class='fa fa-shopping-cart'><span class='basket-counter' data-count='0'>" +
              pocet_celkom +
              "</span></i>"
          );
          $("#hladisko-nsektor-basket-pocet").html("" + pocet_predstavenie);
          $("#hladisko-nsektor-basket-cena").html(
            Format_mena(cena_predstavenie)
          );

          // pre pripad iframe
          $("#hladisko-basket-all-count").html("&nbsp;(" + pocet_celkom + ")");
          if (pocet_celkom > 0)
            $("#hladisko-basket-btn").removeClass("disabled");
          else $("#hladisko-basket-btn").addClass("disabled");
        } else {
          $("#hladisko-basket-all-count").html("&nbsp;(" + pocet_celkom + ")");
          //$('#basketko').html("<i class='fa fa-shopping-cart'></i><span class='basket-counter' data-count='0'>" + pocet_celkom + "</span>");
          $("#hladisko-pocet").html("" + pocet_predstavenie);
          $("#hladisko-cena").html(Format_mena(cena_predstavenie));
          $(".basket-counter").html("" + pocet_celkom);
          changeBasketValue();

          if (pocet_celkom > 0)
            $("#hladisko-basket-btn").removeClass("disabled");
          else $("#hladisko-basket-btn").addClass("disabled");
        }

        var idp = g_performance.ID;
        var basketP = data.ReturnedObject.Basket.Performance_count[idp];
        for (var i in basketP) {
          var miesto = basketP[i];
          oznacene[miesto.ID_Miesto_Javisko] = 1;
          m[m_all[miesto.ID_Miesto_Javisko][0]][1] = 0;
        }

        oznacene[data.ReturnedObject.ID_Miesto_Javisko] = 1;
        PrekresliCanvas();
        OverMedzery(false);

        if (is_mobile) {
          if (MaBublinaPovSluzbu()) {
            ZobrazBublinu(0, 0, true);
          }
        }
      } else {
        m[miesto][1] = 1;
        PrekresliCanvas();
        alert(data.Message);
      }
    } else {
      if (typeof miesto != "undefined") m[miesto][1] = 1;
      PrekresliCanvas();
      alert(data.Message);
    }
  });
}

function OdznacVsetkyMiesta() {
  $.ajax({
    url:
      absoluteUri +
      "Event/RemoveSeatPerformance/" +
      g_performance.ID +
      "?ug=" +
      user_guid,
    cache: false,
    statusCode: {
      404: function () {
        alert("Page not found.");
      },
      500: function () {
        alert("Internal server error.");
      },
    },
  }).done(function (data) {
    if (data.Succeeded) {
      if (data.ReturnedObject.Succeeded) {
        ReloadBasket(data.ReturnedObject.Basket);

        var pocet_predstavenie = 0;
        var cena_predstavenie = 0;
        var pocet_celkom = 0;

        for (var i in data.ReturnedObject.Basket.items) {
          var item = data.ReturnedObject.Basket.items[i];

          if (item.ID_Predstavenie == g_performance.ID) {
            pocet_predstavenie++;
            cena_predstavenie += item.Cena;
          }
          pocet_celkom++;
        }

        // Priority kontrola
        if (
          typeof minSeatCount != "undefined" &&
          typeof maxSeatCount != "undefined"
        ) {
          ok = true;

          if (minSeatCount != null && pocet_predstavenie < minSeatCount)
            ok = false;

          if (maxSeatCount != null && pocet_predstavenie > maxSeatCount)
            ok = false;

          if (ok) {
            $("#hladisko-basket-btn").removeAttr("disabled");
            if ($("#modal_hladisko_priority_msg").length != 0)
              $("#modal_hladisko_priority_msg")[0].style.color = "green";
          } else {
            $("#hladisko-basket-btn").attr("disabled", "disabled");
            if ($("#modal_hladisko_priority_msg").length != 0)
              $("#modal_hladisko_priority_msg")[0].style.color = "red";
          }
        }
        //

        if (is_mobile || QueryString["fb"] == "" || getDocWidth() < 768) {
          var $infoKosik = $(".kosik-box");
          var $vyberPocetVst = $(".vyber-pocet-vst");

          if (pocet_celkom > 0) {
            if ($infoKosik.hasClass("hidden")) {
              $infoKosik
                .removeClass("hidden")
                .removeClass($vyberPocetVst)
                .addClass("animated " + animationNameKosik)
                .one(animationEnd, function () {});
            }
          } else {
            if (!$infoKosik.hasClass("hidden")) $infoKosik.addClass("hidden");
          }

          $("#hladisko_basket_2").html(
            "<i class='fa fa-shopping-cart'><span class='basket-counter' data-count='0'>" +
              pocet_celkom +
              "</span></i>"
          );
          $("#hladisko-nsektor-basket-pocet").html("" + pocet_predstavenie);
          $("#hladisko-nsektor-basket-cena").html(
            Format_mena(cena_predstavenie)
          );

          // pre pripad iframe
          $("#hladisko-basket-all-count").html("&nbsp;(" + pocet_celkom + ")");
          if (pocet_celkom > 0)
            $("#hladisko-basket-btn").removeClass("disabled");
          else $("#hladisko-basket-btn").addClass("disabled");
        } else {
          $("#hladisko-basket-all-count").html("&nbsp;(" + pocet_celkom + ")");
          //$('#basketko').html("<i class='fa fa-shopping-cart'></i><span class='basket-counter' data-count='0'>" + pocet_celkom + "</span>");
          $("#hladisko-pocet").html("" + pocet_predstavenie);
          $("#hladisko-cena").html(Format_mena(cena_predstavenie));
          $(".basket-counter").html(pocet_celkom);

          if (pocet_celkom > 0)
            $("#hladisko-basket-btn").removeClass("disabled");
          else $("#hladisko-basket-btn").addClass("disabled");

          changeBasketValue();
        }

        for (var i in oznacene) {
          if (oznacene.hasOwnProperty(i)) {
            m[m_all[i][0]][1] = 0;
            oznacene[i] = 0;
          }
        }
        PrekresliCanvas();
        OverMedzery(false);
      } else {
        alert("Nepodarilo sa odznacit miesto");
      }
    } else {
      alert("Nepodarilo sa odznacit miesto");
    }
  });
}

function OdznacMiesto(miesto, pp_prednostny) {
  var id_kategoria = m_all[miesto][3];
  var vip_kat = g_performance.PriceCategories[id_kategoria];

  $.ajax({
    url:
      absoluteUri +
      "Event/RemoveSeats/" +
      g_performance.ID +
      "/" +
      miesto +
      "?ug=" +
      user_guid,
    cache: false,
    statusCode: {
      404: function () {
        alert("Page not found.");
      },
      500: function () {
        alert("Internal server error.");
      },
    },
  }).done(function (data) {
    if (data.Succeeded) {
      if (data.ReturnedObject.Succeeded) {
        vip_kat.MaxCount += 1;

        ReloadBasket(data.ReturnedObject.Basket);

        var pocet_predstavenie = 0;
        var cena_predstavenie = 0;
        var pocet_celkom = 0;

        for (var i in data.ReturnedObject.Basket.items) {
          if (data.ReturnedObject.Basket.items.hasOwnProperty(i)) {
            var item = data.ReturnedObject.Basket.items[i];

            if (item.ID_Predstavenie == g_performance.ID) {
              pocet_predstavenie++;
              cena_predstavenie += item.Cena;
            }
            pocet_celkom++;
          }
        }

        // Priority kontrola
        if (
          typeof minSeatCount != "undefined" &&
          typeof maxSeatCount != "undefined"
        ) {
          ok = true;

          if (minSeatCount != null && pocet_predstavenie < minSeatCount)
            ok = false;

          if (maxSeatCount != null && pocet_predstavenie > maxSeatCount)
            ok = false;

          if (ok) {
            $("#hladisko-basket-btn").removeAttr("disabled");
            if ($("#modal_hladisko_priority_msg").length != 0)
              $("#modal_hladisko_priority_msg")[0].style.color = "green";
          } else {
            $("#hladisko-basket-btn").attr("disabled", "disabled");
            if ($("#modal_hladisko_priority_msg").length != 0)
              $("#modal_hladisko_priority_msg")[0].style.color = "red";
          }
        }
        //

        if (is_mobile || QueryString["fb"] == "" || getDocWidth() < 768) {
          var $infoKosik = $(".kosik-box");
          var $vyberPocetVst = $(".vyber-pocet-vst");

          if (pocet_celkom > 0) {
            if ($infoKosik.hasClass("hidden")) {
              $infoKosik
                .removeClass("hidden")
                .removeClass($vyberPocetVst)
                .addClass("animated " + animationNameKosik)
                .one(animationEnd, function () {});
            }
          } else {
            if (!$infoKosik.hasClass("hidden")) $infoKosik.addClass("hidden");
          }

          $("#hladisko_basket_2").html(
            "<i class='fa fa-shopping-cart'><span class='basket-counter' data-count='0'>" +
              pocet_celkom +
              "</span></i>"
          );
          $("#hladisko-nsektor-basket-pocet").html("" + pocet_predstavenie);
          $("#hladisko-nsektor-basket-cena").html(
            Format_mena(cena_predstavenie)
          );
        } else {
          $("#hladisko-basket-all-count").html("&nbsp;(" + pocet_celkom + ")");
          //$('#basketko').html("<i class='fa fa-shopping-cart'></i><span class='basket-counter' data-count='0'>" + pocet_celkom + "</span>");
          $("#hladisko-pocet").html("" + pocet_predstavenie);
          $("#hladisko-cena").html(Format_mena(cena_predstavenie));
          $(".basket-counter").html("" + pocet_celkom);

          if (pocet_celkom > 0)
            $("#hladisko-basket-btn").removeClass("disabled");
          else $("#hladisko-basket-btn").addClass("disabled");

          changeBasketValue();
        }

        var idp = g_performance.ID;
        var basketP = data.ReturnedObject.Basket.Performance_count[idp];
        var buff = new Array();
        for (var i in basketP) {
          var miesto = basketP[i];
          buff[miesto.ID_Miesto_Javisko] = 1;
        }
        for (var i in oznacene) {
          if (oznacene[i] == 1 && (buff[i] == null || buff[i] == 0)) {
            m[m_all[i][0]][1] = 0; // Oznacime miesto ko volne
            oznacene[i] = 0; // Odznacime miesto
          }
        }

        m[m_all[data.ReturnedObject.ID_Miesto_Javisko][0]][1] = 0; // Oznacime miesto ko volne
        oznacene[data.ReturnedObject.ID_Miesto_Javisko] = 0; // Odznacime miesto
        PrekresliCanvas();
        OverMedzery(false);

        if (typeof pp_prednostny != "undefined" && pp_prednostny) {
          Performance_pp_prednostny_prepocitaj(
            isnull(basket_simple) ? null : basket_simple,
            g_performance.ID
          );
          return;
        }
      }
      if (
        typeof data.ReturnedObject.Message !== "undefined" &&
        data.ReturnedObject.Message !== null &&
        data.ReturnedObject.Message !== ""
      ) {
        alert(data.ReturnedObject.Message);
      } else {
        //alert("Nepodarilo sa odznacit miesto");
      }
    } else {
      if (
        typeof data.ReturnedObject.Message !== "undefined" &&
        data.ReturnedObject.Message !== null &&
        data.ReturnedObject.Message !== ""
      ) {
        alert(data.ReturnedObject.Message);
      } else {
        alert("Nepodarilo sa odznacit miesto");
      }
    }
  });
}

function ReloadBasket(data) {
  if (typeof basket_simple == "undefined") window["basket_simple"] = data;
  else basket_simple = data;

  Basket = new Array();

  for (var i in data.items) {
    if (data.items.hasOwnProperty(i)) {
      var item = data.items[i];

      if (
        typeof Basket[item.ID_Predstavenie] == "undefined" ||
        Basket[item.ID_Predstavenie] == null
      )
        Basket[item.ID_Predstavenie] = new Array();

      Basket[item.ID_Predstavenie].push({
        id_predstavenie: item.ID_Predstavenie,
        ID_Miesto_Javisko: item.ID_Miesto_Javisko,
        Cena: item.Cena,
        ID_Miesto_sluzba: item.ID_Miesto_sluzba,
        BelongsTo: item.BelongsTo,
      });
    }
  }

  if (typeof isQuickPurcharse != "undefined" && isQuickPurcharse == true) {
    SpracujRychlyNakup(data);
  }
  //if (typeof (Spracuj_basket_balicek) != "undefined") {
  //    Spracuj_basket_balicek();
  //}
}

function scrollToNseat() {
  $("#modalHladisko").animate(
    {
      scrollTop: $("#hladisko-button-count-container").offset().top,
    },
    1500
  );
}

var pocetSektor_ = 0;
function ZobrazitNMiest(id_sektor) {
  if (typeof PovoleneSektory != "undefined") {
    if (isnull(PovoleneSektory[id_sektor])) return;
  }

  id_sektor_nmiest = id_sektor;
  $("#zoznam-volnych-miest-text").html(
    s_all[id_sektor] +
      (g_performance.ShowHiddenSeats
        ? " ( " + SektorPocetVolnych[id_sektor] + " )"
        : "") +
      "<i class='fa fa-chevron-down pull-right'></i>"
  );
  $("#zoznam-sektorov").addClass("hidden");

  var pocet = 0;
  var cena = 0;
  // Zistime kolko miest z tohto sektoru je v kosiku
  for (var i in Basket[g_performance.ID]) {
    if (Basket[g_performance.ID].hasOwnProperty(i)) {
      var obj = Basket[g_performance.ID][i];
      var id_miesto = obj.ID_Miesto_Javisko;

      if (m_all[id_miesto][7] == id_sektor) {
        pocet++;
        cena += obj.Cena;
      }
    }
  }

  if (isnull(g_performance.Resale.Nsektor[id_sektor])) {
    $("#resaleNseats").addClass("hidden");
  } else {
    $("#resaleNseats").removeClass("hidden");
    var pocet = g_performance.Resale.Nsektor[id_sektor];

    var HTML = new Array();
    HTML.push(
      "<option value='0' selected='selected'>Zvolte pocet vstupenek? Max. " +
        pocet +
        "ks</option>"
    );
    for (var i = 1; i <= pocet; i++)
      HTML.push("<option value='" + i + "' >" + i + "</option>");
    $("#resaleNseats-count").html(HTML.join(" "));

    /*var elems = document.getElementById("resaleNseats-count").childNodes;
        for (var i = 0; i < elems.length; i++) {
            if (elems[i].nodeName == "OPTION") {

                if (Number(elems[i].value) <= pocet)
                    elems[i].style.display = "inline";
                else
                    elems[i].style.display = "none";
            }
        }*/
  }

  $.ajax({
    url:
      absoluteUri +
      "Event/PerformanceSektorMaxrez/" +
      g_performance.ID +
      "/" +
      id_sektor_nmiest +
      "?ug=" +
      user_guid,
    dataType: "json",
    cache: false,
    async: false,
    statusCode: {
      404: function () {
        alert("Page not found.");
      },
      500: function () {
        alert("Internal server error.");
      },
    },
  }).done(function (data) {
    if (data.Succeeded) {
      pocet_rez_nmiest = data.ReturnedObject.Max_rez;
    } else {
      pocet_rez_nmiest = 0;
    }
    data = data.ReturnedObject;

    var id_kategoria = 0;
    for (var i in SektorKategoriePocetVolnych[id_sektor]) {
      id_kategoria = i;
      break;
    }
    var cena = k_all[id_kategoria][2];
    var maSluzbu = false;

    if (g_performance.Services != null) {
      for (var i = 0; i < g_performance.Services.length; i++) {
        var service = g_performance.Services[i];
        if (
          (service.ID_Sector == id_sektor || service.ID_Sector == 0) &&
          (service.ID_price_Category == id_kategoria ||
            service.ID_price_Category == 0)
        ) {
          cena += service.ServicePrice;
          maSluzbu = true;
        }
      }
    }

    // Zistime ci je priority a ak ano, tak kolko miesto moze oznacit s tohto sektora
    var pocet_predstavenie = 0;
    pocetSektor_ = pocet_rez_nmiest;
    if (
      typeof minSeatCount != "undefined" &&
      typeof maxSeatCount != "undefined"
    ) {
      for (var i in Basket[g_performance.ID]) {
        if (Basket[g_performance.ID].hasOwnProperty(i)) {
          var item = Basket[g_performance.ID][i];
          if (item.id_predstavenie == g_performance.ID) {
            pocet_predstavenie++;
          }
        }
      }

      var pocetSektor2 = maxSeatCount - (pocet_predstavenie - pocet);
      if (pocetSektor2 < pocetSektor_) pocetSektor_ = pocetSektor2;
    }

    //Zistime ci nejde o pnpp
    if (typeof __pp_prednostny != "undefined" && __pp_prednostny) {
      for (var iPS = 0; iPS < PovoleneSektoryKategorie.length; iPS++) {
        var PS = PovoleneSektoryKategorie[iPS];
        if (
          (PS.id_sektor == 0 || PS.id_sector == id_sektor_nmiest) &&
          (PS.id_kategoria == 0 || PS.id_kategoria == id_kategoria)
        ) {
          pocetSektor_ = PS.max;
        }
      }
    }

    $("#modalVyberPocetMiest20").css("z-index", 5000);
    $("#modalVyberPocetMiest20").modal("show");
    $("#modalVyberPocetMiest20 #NPerformance_Name").html(
      lang["lbSektor"] + ": " + s_all[id_sektor]
    );
    $("#quickpurchase_performance_info").css("display", "none");

    if (
      true /*typeof (performance.Discounts) != "undefined" && performance.Discounts != null && performance.Discounts.length != 0*/
    ) {
      $("#modalVyberPocetMiest20 .vyber-zlavy").removeClass("hidden");
      $("#modalVyberPocetMiest20 .vyber-poctu-miest").addClass("hidden");

      var HTML = new Array();

      $("#modalVyberPocetMiest20 .pokracuj-kosik-btn").attr(
        "onclick",
        "Nperf_dis_add_sectors();"
      );

      for (var iz = 0; iz < data.Discounts.length; iz++) {
        var dis = data.Discounts[iz];

        var s = dis.suma;

        if (dis.ID_zlava == 0) {
          s = cena;
        } else {
          if (dis.percento != 0) {
            s = cena * (1.0 - dis.percento / 100.0);
          }
          if (dis.suma < 0) s = cena + dis.suma;
        }

        if (maSluzbu == false) {
          HTML.push('<div class="list-group-item">');
          HTML.push('    <div class="item auto">');
          HTML.push('        <div class="">' + dis.typ_zlavy + "</div>");
          HTML.push('        <p class="text">' + dis.popis + "</p>");
          HTML.push("    </div>");
          HTML.push('    <div class="item initial text-nowrap select-count">');
          HTML.push(
            '        <select class="form-control" name="dis_' +
              g_id_performance +
              "_" +
              dis.ID_zlava +
              '" id="dis_' +
              g_id_performance +
              "_" +
              dis.ID_zlava +
              '" suma="' +
              s +
              '" onchange="Nperf_dis_sel_sectors();">'
          );
          for (var pocet = 0; pocet <= pocetSektor_; pocet++)
            HTML.push(
              '            <option value="' +
                pocet +
                '" ' +
                (pocet == dis.pocet_kosik ? ' selected="selected" ' : "") +
                ">" +
                pocet +
                "</option>"
            );

          HTML.push("        </select>");
          HTML.push("    </div>");
          HTML.push(
            '    <div class="item initial  price text-nowrap">' +
              Format_mena(s) +
              "</div>"
          );
          HTML.push("</div>");
        } else {
          HTML.push('<div class="list-group-item">');
          HTML.push('    <div class="item auto">');
          HTML.push("        <div></div>");

          HTML.push('<div class="discounts">');
          HTML.push('    <p class="discount-text d-flex p-2">');
          HTML.push(
            '        <span class="me-auto text-uppercase"><b>' +
              s_all[id_sektor] +
              "</b></span>"
          );
          HTML.push(
            '        <span class="text-nowrap price tw-0">' +
              Format_mena(k_all[id_kategoria][2]) +
              "</span>"
          );
          HTML.push("    </p>");

          for (var i = 0; i < g_performance.Services.length; i++) {
            var service = g_performance.Services[i];
            if (
              (service.ID_Sector == id_sektor || service.ID_Sector == 0) &&
              (service.ID_price_Category == id_kategoria ||
                service.ID_price_Category == 0)
            ) {
              cena += service.ServicePrice;
              maSluzbu = true;

              HTML.push('    <p class="discount-text d-flex p-2">');
              HTML.push(
                '        <span class="me-auto">' +
                  service.ServiceName +
                  "</span>"
              );
              HTML.push(
                '        <span class="text-nowrap price tw-0">+ ' +
                  Format_mena(service.ServicePrice) +
                  "</span>"
              );
              HTML.push("    </p>");
            }
          }
          HTML.push("</div>");

          HTML.push("    </div>");
          HTML.push('    <div class="item initial text-nowrap select-count">');
          HTML.push(
            '        <select class="form-control" name="dis_' +
              g_id_performance +
              "_" +
              dis.ID_zlava +
              '" id="dis_' +
              g_id_performance +
              "_" +
              dis.ID_zlava +
              '" suma="' +
              s +
              '" onchange="Nperf_dis_sel_sectors();">'
          );
          for (var pocet = 0; pocet <= pocetSektor_; pocet++)
            HTML.push(
              '            <option value="' +
                pocet +
                '" ' +
                (pocet == dis.pocet_kosik ? ' selected="selected" ' : "") +
                ">" +
                pocet +
                "</option>"
            );

          HTML.push("        </select>");
          HTML.push("    </div>");
          HTML.push(
            '    <div class="item initial  price text-nowrap">' +
              Format_mena(s) +
              "</div>"
          );
          HTML.push("</div>");
        }
      }

      HTML.push('<p class="price-sumar">');
      HTML.push('    <span class="">' + lang["lbSpolu"] + "</span > ");
      HTML.push('    <span class="text-nowrap">' + Format_mena(0) + "</span>");
      HTML.push("</p>");

      $("#modalVyberPocetMiest20 .vyber-zlavy .list-group-discounts").html(
        HTML.join("")
      );
      Nperf_dis_sel_sectors();
    }
  });
}

function Nperf_dis_sel_sectors() {
  var selects = $("#modalVyberPocetMiest20 .list-group-discounts select");

  var pocet = 0;
  var cena = 0;

  for (var i = 0; i < selects.length; i++) {
    var p = Number($(selects[i]).val());
    pocet += p;
    cena = cena + p * Number($(selects[i]).attr("suma"));
  }

  $(
    "#modalVyberPocetMiest20 .list-group-discounts .price-sumar span.text-nowrap"
  ).html(Format_mena(cena));

  var pp = pocetSektor_ - pocet;

  for (var i = 0; i < selects.length; i++) {
    var p = Number($(selects[i]).val());

    for (var ii = 0; ii < selects[i].options.length; ii++) {
      var option = selects[i].options[ii];

      if (Number(option.value) > pp + p && option.value != p) {
        option.style.display = "none";
      } else {
        option.style.display = "";
      }
    }
  }

  if (pocet > 0)
    $("#modalVyberPocetMiest20 .pokracuj-kosik-btn").removeAttr("disabled");
  else
    $("#modalVyberPocetMiest20 .pokracuj-kosik-btn").attr(
      "disabled",
      "disabled"
    );
}

function Nperf_dis_add_sectors() {
  var selects = $("#modalVyberPocetMiest20 .list-group-discounts select");
  var data = "";

  for (var i = 0; i < selects.length; i++) {
    var p = Number($(selects[i]).val());
    var id_zlava = Number(selects[i].id.split("_")[2]);
    if (p > 0) data = data + (data != "" ? ";" : "") + id_zlava + "," + p;
  }

  if (data == "") {
    window.location = "/basket";
  }

  if (typeof __pp_prednostny == "undefined" || __pp_prednostny == null)
    __pp_prednostny = false;

  $.ajax({
    url:
      absoluteUri +
      "Event/SetNPerfDiscount/" +
      g_performance.ID +
      "?d=" +
      data +
      "&s=" +
      id_sektor_nmiest +
      "&pppred=" +
      __pp_prednostny,
    dataType: "json",
    cache: false,
    statusCode: {
      404: function () {
        alert("Page not found.");
      },
      500: function () {
        alert("Internal server error.");
      },
    },
  }).done(function (data) {
    if (data.Succeeded) {
      if (typeof fbq != "undefined") fbq("track", "AddToCart");
      $("#modalVyberPocetMiest20").modal("hide");
      ReloadBasket(data.ReturnedObject.Basket);

      $("#hladisko-basket-btn").removeAttr("disabled");

      check_redirect_basket();
    } else alert(data.Message);
  });
}

function oznac_spravny_pocet_sektor() {
  $("#hladisko-button-count-container .btn.btn-primary.active").removeClass(
    "active"
  );

  if (aktivne_teraz != null) aktivne_teraz.addClass("active");
}

// Vola sa ked pouzivatel jklikne na pocet miest, ktore chce vlozit do kosika pre N-Miestny sektor
function NSektorPerformance_setCount(count) {
  aktivne_teraz = $("#hladisko-button-count-container .btn.btn-primary.active");

  if (
    typeof $("#hladisko-nsektor-button-" + count).attr("disabled") !=
      "undefined" &&
    $("#hladisko-nsektor-button-" + count).attr("disabled") == "disabled"
  ) {
    setTimeout("oznac_spravny_pocet_sektor();", 10);

    if (
      typeof event != "undefined" &&
      typeof event.stopPropagation != "undefined"
    )
      event.stopPropagation();

    return false;
  }

  if (typeof __pp_prednostny == "undefined" || __pp_prednostny == null)
    __pp_prednostny = false;

  $.ajax({
    url:
      absoluteUri +
      "Event/SetNSeats/" +
      g_performance.ID +
      "/" +
      count +
      "?idsektor=" +
      id_sektor_nmiest +
      "&ug=" +
      user_guid +
      "&pppred=" +
      __pp_prednostny,
    dataType: "json",
    cache: false,
    statusCode: {
      404: function () {
        alert("Page not found.");
      },
      500: function () {
        alert("Internal server error.");
      },
    },
  }).done(function (data) {
    if (data.Succeeded == true) {
      ReloadBasket(data.ReturnedObject.Basket);

      var pocet_predstavenie = 0;
      var cena_predstavenie = 0;

      var pocet_sektor = 0;
      var cena_sektor = 0;

      var pocet_celkom = 0;

      pocet_predstavenie =
        data.ReturnedObject.Basket.Performance_count[g_performance.ID].length;

      for (var i in data.ReturnedObject.Basket.items) {
        if (data.ReturnedObject.Basket.items.hasOwnProperty(i)) {
          var item = data.ReturnedObject.Basket.items[i];

          if ((item.ID_Predstavenie = g_performance.ID)) {
            //pocet_predstavenie++;
            cena_predstavenie += item.Cena;

            /*if (isnull(m_all[item.ID_Miesto_Javisko]))
                        {
                            pocet_celkom = data.ReturnedObject.Basket.Count;
                            pocet_sektor = data.ReturnedObject.Basket.Count;
                            cena_predstavenie = data.ReturnedObject.Basket.Price;
                            cena_sektor = data.ReturnedObject.Basket.Price;
                            pocet_celkom = data.ReturnedObject.Basket.Count;
    
                            break;
                        }*/

            if (isnull(m_all[item.ID_Miesto_Javisko]) == false) {
              if (m_all[item.ID_Miesto_Javisko][7] == id_sektor_nmiest) {
                pocet_sektor++;
                cena_sektor += item.Cena;
              }
            }
          }
          pocet_celkom++;
        }
      }

      var cena = 0;
      for (var mi in data.ReturnedObject.Basket.items) {
        var miest = data.ReturnedObject.Basket.items[mi];
        if (miest.ID_Sector == data.ReturnedObject.ID_Sektor) {
          cena = miest.Cena;
          break;
        }
      }

      //var cena = data.ReturnedObject.Basket.items[data.ReturnedObject.ID_Miesto_Predstavenie].Cena;
      var mena =
        lokalita == "sk"
          ? "EUR"
          : lokalita == "cz"
          ? "CZK"
          : lokalita == "pl"
          ? "PLN"
          : "HUF";
      if (typeof fbq != "undefined") {
        fbq("track", "AddToCart", {
          content_name: g_performance.EventName,
          //content_category: 'Apparel & Accessories > Shoes',
          content_ids: [g_performance.Event.EventOut.ID_Out],
          content_type: "product",
          value: cena_sektor,
          currency: mena,
        });
      }

      // Priority kontrola
      if (
        typeof minSeatCount != "undefined" &&
        typeof maxSeatCount != "undefined"
      ) {
        ok = true;

        if (minSeatCount != null && pocet_predstavenie < minSeatCount)
          ok = false;

        if (maxSeatCount != null && pocet_predstavenie > maxSeatCount)
          ok = false;

        if (ok) {
          $("#hladisko-basket-btn").removeAttr("disabled");
          $("#hladisko_basket_2").removeAttr("disabled");
          if ($("#modal_hladisko_priority_msg").length != 0)
            $("#modal_hladisko_priority_msg")[0].style.color = "green";
        } else {
          $("#hladisko-basket-btn").attr("disabled", "disabled");
          $("#hladisko_basket_2").attr("disabled", "disabled");
          if ($("#modal_hladisko_priority_msg").length != 0)
            $("#modal_hladisko_priority_msg")[0].style.color = "red";
        }
      }
      //

      $("#hladisko-button-count-container label").removeClass("active");
      $("#hladisko-nsektor-button-" + pocet_sektor).addClass("active");

      if (is_mobile) {
        $("#hladisko_basket_2").html(
          "<i class='fa fa-shopping-cart'><span class='basket-counter' data-count='0'>" +
            pocet_celkom +
            "</span></i>"
        );
        $("#hladisko-nsektor-basket-pocet").html("" + pocet_predstavenie);
        $("#hladisko-nsektor-basket-cena").html(Format_mena(cena_predstavenie));
      } else {
        $("#hladisko-nsektor-basket-pocet").html(pocet_sektor);
        $("#hladisko-nsektor-basket-cena").html(Format_mena(cena_sektor));
        $("#hladisko-pocet").html(pocet_predstavenie);
        $("#hladisko-cena").html(Format_mena(cena_predstavenie));
        //$('#basketko').html('<i class="fa fa-shopping-cart"></i><span class="basket-counter" data-count="0">' + pocet_celkom + '</span>');
        $("#hladisko-basket-all-count").html("&nbsp;(" + pocet_celkom + ")");
        $(".basket-counter").html("" + pocet_celkom);

        if (pocet_celkom > 0) $("#hladisko-basket-btn").removeClass("disabled");
        else $("#hladisko-basket-btn").addClass("disabled");
      }

      changeBasketValue();
      /*
            $('#hladisko-nsektor-basket-pocet').html(data.ReturnedObject.NumberOfPerformance);
            $("#hladisko-nsektor-basket-cena").html(Format_mena(g_performance.PriceCategories[0].Price * data.ReturnedObject.NumberOfPerformance));



            if (g_count_basket == 0) {
                var $zaplatitBtn = $('.modal-footer .pokracuj-kosik-btn');
                var $sumar = $(".spolu-sumar");

                $zaplatitBtn.removeAttr("disabled");
                $sumar.parent().addClass("text-zlta");

                $sumar.addClass("animated " + animationName).one(animationEnd, function () {
                    //sem co sa stane po animacii
                    $sumar.removeClass(animationName)
                });
            }*/
      //AnimateBasket();
    } else {
      if (data.Message != null && data.Message == "NONE") return;

      alert(data.Message);
    }
  });
}

// Zisti kolko miest je mozne oznacit v n-miestnom sektore
function PocetPreSektor() {}

// Zavrie moznost vyberu poctu miest v N-miestnom sektore
function ZavryNMiest() {
  var $infoKosik = $(".kosik-box");
  var $vyberPocetVst = $(".vyber-pocet-vst");

  if (!is_mobile) $infoKosik.addClass("hidden");

  $vyberPocetVst.addClass("hidden");

  $(".zoom-control").css("bottom", "15%");
}

// Overi ci je mozne prejst do kosika a ak ano, presmeruje pouzivatela do kosika
function check_redirect_basket() {
  if (
    typeof $("#hladisko-basket-btn").attr("disabled") != "undefined" &&
    $("#hladisko-basket-btn").attr("disabled") == "disabled"
  )
    return;

  if (OverMedzery() == false) return;

  if (typeof id_miesto_vymena != "undefined" && id_miesto_vymena != null) {
    $("#modalHladisko").modal("hide");
    SpracujVymenaVstupenky();
    return;
  }

  if (typeof __pp_prednostny != "undefined" && __pp_prednostny) {
    Performance_pp_prednostny_prepocitaj(
      isnull(basket_simple) ? null : basket_simple,
      g_performance.ID
    );
    return;
  }

  if (typeof balicek_vstupeniek != "undefined") {
    $("#modalHladisko").modal("hide");
    Spracuj_basket_balicek();
    Balicek_automat_next();
    return;
  } else {
    canceled = true;
    window.document.body.className = "pace-running";

    window.location = linkIframe(absoluteUri + "Basket");
  }
}

// Kazdych 10 sek zisti stav miest obsadene/volne a prekresli hladisko
function ReloadSeats() {
  if (typeof g_performance == "undefined") return;

  if (g_performance == null) {
    setTimeout("ReloadSeats();", 10000);
    return;
  }

  if (typeof linkmiesta == "undefined") {
    setTimeout("ReloadSeats();", 10000);
    return;
  }

  $("#preloader").css("display", "none"); // Vypneme zobrazenie preloaderu

  $.ajax({
    url: linkmiesta,
  }).done(function (data) {
    eval(data.replace("var", ""));

    $("#preloader").css("display", ""); // Zapneme zobrazenie preloaderu

    var c = 0;
    for (var i in m) {
      if (m.hasOwnProperty(i)) {
        var item = m[i];
        item[0] = item[0] + c;
        c = item[0];
      }
    }

    buff = m;
    m = new Array();
    for (var i in buff) {
      if (buff.hasOwnProperty(i)) {
        m[buff[i][0]] = buff[i];
      }
    }

    // Ak priority zablokovalo sektory
    if (typeof PovoleneSektory != "undefined") {
      for (var i in m) {
        if (m_all[i] != null) {
          var id_sektor = m_all[i][7];
          if (isnull(PovoleneSektory[id_sektor])) m[i][1] = 2;
        }
      }
    }

    if (typeof PovoleneSektoryKategorie != "undefined") {
      var b = new Array();
      for (var id_sektor in s_all) {
        if (b[id_sektor] == null) b[id_sektor] = new Array();
        for (var id_kategoria in k_all) {
          b[id_sektor][id_kategoria] = false;
        }
      }
      for (var is = 0; is < PovoleneSektoryKategorie.length; is++) {
        var settings = PovoleneSektoryKategorie[is];

        if (settings.id_sektor == 0 && settings.id_kategoria == 0) {
          for (var idsektor in b) {
            for (var idkategoria in b[id_sektor]) {
              b[idsektor][idkategoria] = true;
            }
          }
        }
        if (settings.id_sektor != 0 && settings.id_kategoria == 0) {
          for (var idsektor in b) {
            for (var idkategoria in b[id_sektor]) {
              if (idsektor == settings.id_sektor)
                b[idsektor][idkategoria] = true;
            }
          }
        }
        if (settings.id_sektor == 0 && settings.id_kategoria != 0) {
          for (var idsektor in b) {
            for (var idkategoria in b[id_sektor]) {
              if (idkategoria == settings.id_kategoria)
                b[idsektor][idkategoria] = true;
            }
          }
        }
        if (settings.id_sektor != 0 && settings.id_kategoria != 0) {
          for (var idsektor in b) {
            for (var idkategoria in b[id_sektor]) {
              if (
                idkategoria == settings.id_kategoria &&
                idsektor == settings.id_sektor
              )
                b[idsektor][idkategoria] = true;
            }
          }
        }
      }

      for (var i in m) {
        if (m_all[i] != null) {
          var id_sektor = m_all[i][7];
          var id_kategoria = m_all[i][3];

          if (b[id_sektor][id_kategoria] == false) m[i][1] = 2;
        }
      }
    }

    PrekresliCanvas();
    setTimeout("ReloadSeats();", 10000);
  });
}

setTimeout("ReloadSeats();", 10000);

// Ked pouzivatel klikne na sektor, tak v zozname sektorov sa vypise, ze aky sektor sa zobrazuje
function ZobrazujemSektor(id_sektor, nazov) {
  if (g_performance.ZobrazPercenta == true) {
    var uvolnenych = 0;
    var volnych = 0;

    for (var idk in SektorKategoriePocetUvolnenych[id_sektor]) {
      uvolnenych += SektorKategoriePocetUvolnenych[id_sektor][idk];
    }
    for (var idk in SektorKategoriePocetVolnych[id_sektor]) {
      volnych += SektorKategoriePocetVolnych[id_sektor][idk];
    }

    var percento = Math.round(volnych / (uvolnenych / 100.0));
    var percentoStr = percento + "%";
    document.getElementById("zoznam-volnych-miest-text").innerHTML =
      s_all[id_sektor] +
      (g_performance.ShowHiddenSeats ? " ( " + percentoStr + " )" : "") +
      "<i class='fa fa-chevron-down pull-right'></i>";
  } else {
    document.getElementById("zoznam-volnych-miest-text").innerHTML =
      s_all[id_sektor] +
      (g_performance.ShowHiddenSeats
        ? " ( " + SektorPocetVolnych[id_sektor] + " )"
        : "") +
      "<i class='fa fa-chevron-down pull-right'></i>";
  }

  $(".zoznam-sektorov").addClass("hidden");
}

//Generuje zoznam sektorov a cenove kategorie
function GenerateSektor() {
  var HTML = new Array();
  HTML.push("<div class='list-group'>");

  povinne_sluzby = new Array();
  if (isnull(g_performance.Services) == false) {
    for (var i in g_performance.Services) {
      if (g_performance.Services.hasOwnProperty(i)) {
        var sluzba = g_performance.Services[i];

        if (sluzba.ID_Sector != 0) {
          if (isnull(povinne_sluzby[sluzba.ID_Sector]))
            povinne_sluzby[sluzba.ID_Sector] = new Array();
        } else {
          for (var id_s in s_all) {
            if (isnull(povinne_sluzby[id_s]))
              povinne_sluzby[id_s] = new Array();
          }
        }

        if (sluzba.ID_Sector != 0) {
          if (
            1 ==
            1 /*isnull(povinne_sluzby[sluzba.ID_Sector][sluzba.ID_price_Category])*/
          ) {
            if (sluzba.ID_price_Category == 0) {
              //plati pre vsetky kat

              for (var iii in SektorKategoriePocetVolnych[sluzba.ID_Sector]) {
                if (
                  SektorKategoriePocetVolnych[sluzba.ID_Sector].hasOwnProperty(
                    iii
                  )
                ) {
                  //povinne_sluzby[sluzba.ID_Sector][iii] = sluzba;

                  if (povinne_sluzby[sluzba.ID_Sector][iii] == null)
                    povinne_sluzby[sluzba.ID_Sector][iii] = new Array();

                  povinne_sluzby[sluzba.ID_Sector][iii].push(sluzba);
                }
              }
            } else {
              if (
                povinne_sluzby[sluzba.ID_Sector][sluzba.ID_price_Category] ==
                null
              )
                povinne_sluzby[sluzba.ID_Sector][sluzba.ID_price_Category] =
                  new Array();

              povinne_sluzby[sluzba.ID_Sector][sluzba.ID_price_Category].push(
                sluzba
              );
            }
          }
        } else {
          for (var id_s in s_all) {
            if (sluzba.ID_price_Category == 0) {
              //plati pre vsetky kat

              for (var iii in SektorKategoriePocetVolnych[id_s]) {
                if (SektorKategoriePocetVolnych[id_s].hasOwnProperty(iii)) {
                  //povinne_sluzby[sluzba.ID_Sector][iii] = sluzba;

                  if (povinne_sluzby[id_s][iii] == null)
                    povinne_sluzby[id_s][iii] = new Array();

                  povinne_sluzby[id_s][iii].push(sluzba);
                }
              }
            } else {
              if (povinne_sluzby[id_s][sluzba.ID_price_Category] == null)
                povinne_sluzby[id_s][sluzba.ID_price_Category] = new Array();

              povinne_sluzby[id_s][sluzba.ID_price_Category].push(sluzba);
            }
          }
        }
      }
    }
  }

  //abecedne radenie
  var buff_abc = new Array();
  for (var id_sektor in SektorKategoriePocetVolnych) {
    if (SektorKategoriePocetVolnych.hasOwnProperty(id_sektor)) {
      for (var id_kategoria in SektorKategoriePocetVolnych[id_sektor]) {
        if (
          SektorKategoriePocetVolnych[id_sektor].hasOwnProperty(id_kategoria)
        ) {
          buff_abc.push({
            id_sector: id_sektor,
            id_kategoria: id_kategoria,
            Nazov: s_all[id_sektor],
            Cena: k_all[id_kategoria][2],
          });
        }
      }
    }
  }

  buff_abc.sort(sort_sektor_kat);
  var id_sektor_old = buff_abc[0].id_sector;

  for (var i in buff_abc) {
    if (buff_abc.hasOwnProperty(i)) {
      var id_sektor = buff_abc[i].id_sector;
      var id_kategoria = buff_abc[i].id_kategoria;

      //for(var id_sektor in SektorKategoriePocetVolnych) {
      //for (var id_kategoria in SektorKategoriePocetVolnych[id_sektor]) {
      var zobrazene_a = false;
      var pocet_kat = 0;

      if (
        typeof k_all[id_kategoria] != "undefined" &&
        SektorKategoriePocetVolnych[id_sektor][id_kategoria] != 0
      ) {
        var maPovSluzbu = false;
        //if (isnull(povinne_sluzby[id_sektor]) == false) {
        //    if (isnull(povinne_sluzby[id_sektor][id_kategoria]) == false) {
        //        maPovSluzbu = true;
        //    }
        //}

        if (isnull(povinne_sluzby[id_sektor]) == false) {
          if (isnull(povinne_sluzby[id_sektor][id_kategoria]) == false) {
            for (var index in povinne_sluzby[id_sektor][id_kategoria]) {
              if (
                povinne_sluzby[id_sektor][id_kategoria].hasOwnProperty(index)
              ) {
                maPovSluzbu = true;
                break;
              }
            }
          }
        }

        if (!zobrazene_a) {
          if (
            typeof nMiestSektor[id_sektor] != "undefined" &&
            nMiestSektor[id_sektor] != null &&
            nMiestSektor[id_sektor] == 1
          )
            HTML.push(
              "<a href='javascript:ZobrazitNMiest(" +
                id_sektor +
                ");' class='list-group-item" +
                (maPovSluzbu ? " sluzba-plus" : "") +
                "'>"
            );
          else
            HTML.push(
              "<a href='javascript:animacia_na_sektor(" +
                id_sektor +
                ");' class='list-group-item" +
                (maPovSluzbu ? " sluzba-plus" : "") +
                "'>"
            );

          zobrazene_a = true;
        }

        if (pocet_kat != 0) HTML.push("<div class='clearfix'></div>");

        HTML.push("<ul class='list-inline text-right kategoria-sektora'>");
        HTML.push("    <li class='pull-left'>");
        HTML.push(
          "        <i class='fa fa-ticket' style='color: " +
            k_all[id_kategoria][0] +
            ";' '></i> "
        );
        HTML.push(
          "        <span class='list-group-item-text'>" +
            s_all[id_sektor] +
            "</span>"
        );
        HTML.push("    </li>");
        HTML.push("    <li>");

        var popis = "";
        if (lokalita == "hu") {
          popis = g_performance.PriceCategories[id_kategoria].Description;
          if (popis.length > 10) popis = "";
          if (popis != "")
            popis =
              "<span style='font-size:85%;padding-left:3px'>" +
              popis +
              "</span>";
        }

        HTML.push(
          "        <span " +
            (maPovSluzbu ? " style='font-weight:normal' " : "") +
            " class='badge cena' data-toggle='tooltip' data-placement='top' title='" +
            lang["lbCenaVstupenky"] +
            "'>" +
            Format_mena(k_all[id_kategoria][2]) +
            popis +
            "</span>"
        );

        if (
          g_performance.ShowHiddenSeats /*&& g_performance.PriceCategories[id_kategoria].DonNotShowSeats == false*/
        ) {
          if (g_performance.ZobrazPercenta == true) {
            var uvolnenych =
              SektorKategoriePocetUvolnenych[id_sektor][id_kategoria];
            var volnych = SektorKategoriePocetVolnych[id_sektor][id_kategoria];
            var percento = Math.round(volnych / (uvolnenych / 100.0));
            var percentoStr = percento + "%";
            HTML.push(
              "        <span class='badge volne' data-toggle='tooltip' data-placement='top' title='" +
                lang["lbPocetVolnychMiest"] +
                "'>" +
                percentoStr +
                "</span>"
            );
          } else {
            HTML.push(
              "        <span class='badge volne' data-toggle='tooltip' data-placement='top' title='" +
                lang["lbPocetVolnychMiest"] +
                "'>" +
                SektorKategoriePocetVolnych[id_sektor][id_kategoria] +
                "</span>"
            );
          }
        }
        HTML.push("    </li>");
        HTML.push("</ul>");

        var cena_spolu = k_all[id_kategoria][2];
        var pridal_povinnu = false;

        if (isnull(povinne_sluzby[id_sektor]) == false) {
          if (isnull(povinne_sluzby[id_sektor][id_kategoria]) == false) {
            for (var index in povinne_sluzby[id_sektor][id_kategoria]) {
              if (
                povinne_sluzby[id_sektor][id_kategoria].hasOwnProperty(index)
              ) {
                HTML.push("<ul class='list-inline plus text-right'>");
                HTML.push(' <li class="sluzba-text">');
                HTML.push(
                  '     <span class="label label-danger list-group-item-text">'
                );
                HTML.push(
                  '         <i class="fa fa-plus" aria-hidden="true"></i> ' +
                    povinne_sluzby[id_sektor][id_kategoria][index].ServiceName
                );
                HTML.push("     </span>");
                HTML.push(" </li>");
                HTML.push(' <li class="sluzba-cena">');
                HTML.push(
                  '     <span style="font-weight: normal" class="badge cena" data-toggle="tooltip" data-placement="top" title="Cena vstupenky">' +
                    Format_mena(
                      povinne_sluzby[id_sektor][id_kategoria][index]
                        .ServicePrice
                    ) +
                    "</span>"
                );
                HTML.push(" </li>");
                HTML.push("</ul>");

                pridal_povinnu = true;
                cena_spolu +=
                  povinne_sluzby[id_sektor][id_kategoria][index].ServicePrice;
              }
            }
          }
        }

        if (pridal_povinnu) {
          HTML.push(
            "<ul class='list-inline plus text-right' style='margin-top:5px'>"
          );
          HTML.push(' <li class="sluzba-text">');
          HTML.push(
            '     <span class="label label-info list-group-item-text" style="font-size:85%">'
          );
          HTML.push(
            '         <i class="fa fa-shopping-cart" aria-hidden="true"></i> ' +
              lang["lbSpolu"]
          );
          HTML.push("     </span>");
          HTML.push(" </li>");
          HTML.push(' <li class="sluzba-cena">');
          HTML.push(
            '     <span class="badge cena" data-toggle="tooltip" data-placement="top" title="Cena vstupenky">' +
              Format_mena(cena_spolu) +
              "</span>"
          );
          HTML.push(" </li>");
          HTML.push("</ul>");
        }

        pocet_kat++;
      }
    }
    //}
    //}
    //}

    if (id_sektor_old != id_sektor) {
      if (pocet_kat > 1) HTML.push("<div class='clearfix'></div>");

      if (zobrazene_a) HTML.push("</a>");

      id_sektor_old = id_sektor;
    }
  }

  HTML.push("</div>");
  $("#zoznam-sektorov").html(HTML.join("\r\n"));

  for (var i in k_all) {
    if (k_all.hasOwnProperty(i)) {
      k_all[i][6] = 0;
    }
  }

  for (var i in SektorKategoriePocetVolnych) {
    if (SektorKategoriePocetVolnych.hasOwnProperty(i)) {
      var sektor = SektorKategoriePocetVolnych[i];
      for (var id_kat in sektor) {
        if (sektor.hasOwnProperty(id_kat)) {
          var pocet = sektor[id_kat];

          k_all[id_kat][6] += pocet;
        }
      }
    }
  }

  var buff_kat = new Array();
  for (var i in k_all) {
    if (k_all.hasOwnProperty(i)) {
      if (k_all[i][2] > 0 && k_all[i][6] > 0) {
        var kluc = "" + k_all[i][0] + "|" + k_all[i][2];

        if (isnull(buff_kat[kluc])) {
          buff_kat[kluc] = {
            Cena: k_all[i][2],
            Nazov: k_all[i][1],
            ID: i,
            close: false,
            cena_orig: k_all[i][2],
          };
        }
      }
    }
  }

  var buff_kat2 = new Array();
  for (var i in buff_kat) {
    if (buff_kat.hasOwnProperty(i)) {
      buff_kat2.push(buff_kat[i]);
    }
  }

  var dictionary = new Array();
  var append = new Array();

  for (var i in buff_kat2) {
    var kategoria = k_all[buff_kat2[i].ID];
    if (kategoria[2] > 0 && kategoria[6] > 0) {
      if (kategoria[2] != 9999) {
        var cena_povinna_sluzba = 0;
        var service_names = new Array();

        for (var s in povinne_sluzby) {
          if (SektorPocetVolnych[s] > 0) {
            var sektor = povinne_sluzby[s];
            cena_povinna_sluzba = 0;
            for (var k in sektor) {
              if (k == buff_kat2[i].ID) {
                for (var ids = 0; ids < sektor[k].length; ids++) {
                  var sluzba = sektor[k][ids];
                  cena_povinna_sluzba += sluzba.ServicePrice;
                }
              }
            }

            if (cena_povinna_sluzba != 0) {
              if (buff_kat2[i].close == false) {
                buff_kat2[i].Cena += cena_povinna_sluzba;
                buff_kat2[i].close = true;

                dictionary[buff_kat2[i].Nazov + buff_kat2[i].Cena] = 1;
              } else {
                append.push({
                  Cena: buff_kat2[i].cena_orig + cena_povinna_sluzba,
                  Nazov: buff_kat2[i].Nazov,
                  ID: buff_kat2[i].ID,
                  close: true,
                  cena_orig: buff_kat2[i].cena_orig,
                });
              }
            }
          }
        }
      }
    }
  }

  for (var i = 0; i < append.length; i++) {
    if (dictionary[append[i].Nazov + append[i].Cena] == null) {
      buff_kat2.push(append[i]);
      dictionary[append[i].Nazov + append[i].Cena] = 1;
    }
  }

  buff_kat2.sort(sort_kat);

  var kat_HTML = new Array();
  var kat_HTML_dalsie = new Array();

  var c = 0;
  var max_pocet = window.location.href.indexOf("iframe") == -1 ? 8 : 8;

  if (IsMobile()) max_pocet = 100;

  for (var i in buff_kat2) {
    if (buff_kat2.hasOwnProperty(i)) {
      var kategoria = k_all[buff_kat2[i].ID];

      if (kategoria[2] > 0 && kategoria[6] > 0) {
        c++;

        if (kategoria[2] != 9999) {
          var popis = "";
          if (lokalita == "hu") {
            popis = g_performance.PriceCategories[buff_kat2[i].ID].Description;
            if (popis.length > 10) popis = "";
            if (popis.length != 0) popis = " " + popis;
          }

          var cena_povinna_sluzba = 0;
          var service_names = new Array();

          for (var s in povinne_sluzby) {
            if (povinne_sluzby.hasOwnProperty(s) && SektorPocetVolnych[s] > 0) {
              var sektor = povinne_sluzby[s];
              for (var k in sektor) {
                if (k == buff_kat2[i].ID) {
                  for (var ids = 0; ids < sektor[k].length; ids++) {
                    var sluzba = sektor[k][ids];

                    if (service_names[sluzba.ServiceName] == null) {
                      service_names[sluzba.ServiceName] = sluzba.ServiceName;
                      cena_povinna_sluzba += sluzba.ServicePrice;
                    }
                  }
                }
              }
            }
          }

          if (c <= max_pocet)
            kat_HTML.push(
              '<li class="list-group-item"><i class="fa fa-ticket legend" style="color: ' +
                kategoria[0] +
                '"></i><span class="cena">' +
                Format_mena(buff_kat2[i].Cena) +
                popis +
                "</span></li>"
            );
          else
            kat_HTML_dalsie.push(
              '<li class="list-group-item"><i class="fa fa-ticket legend" style="color: ' +
                kategoria[0] +
                '"></i><span class="cena">' +
                Format_mena(kategoria[2]) +
                popis +
                "</span></li>"
            );
        }
      }
    }
  }
  $(".list-group.kategorie-sektora").html(kat_HTML.join(""));

  if (kat_HTML_dalsie.length != 0) {
    $("#root-dalsie-kat-container").removeClass("hidden");
    $("#root-dalsie-kat").html(kat_HTML_dalsie.join(""));
  } else {
    $("#root-dalsie-kat-container").addClass("hidden");
  }
}

function ResetUI() {
  $("#myModalHladiskoLabel").html("...");
  $("#hladisko-pocet").html("-");
  $("#hladisko-cena").html("-");
  $("#hladisko-canvas-container").html("");

  $(".kosik-box").addClass("hidden");
  $(".vyber-pocet-vst").addClass("hidden");
  $(".zoom-control").removeClass("hidden");
  document.getElementById("zoznam-volnych-miest-text").innerHTML =
    lang["lbZoznamVolnychMiest"] +
    "<i class='fa fa-chevron-down pull-right'></i>";
}

function VelkostCanvas() {
  if (window.location.href.toLowerCase().indexOf("/performance/") != -1) {
    def_roz_x = $("#modal-content-hladisko").width() - 20; // Zistime rozmery platna
    def_roz_y =
      window.innerHeight -
      $("#modal-header").outerHeight() -
      $("#modal-control-body").outerHeight() -
      25;
  } else {
    if (is_mobile) {
      def_roz_x = $(window).width() - 20;
      def_roz_y = $(window).height() - 20;
    } else {
      def_roz_x = $("#modal-content-hladisko").width() - 20; // Zistime rozmery platna
      // def_roz_y = window.innerHeight - $('#modal-header').outerHeight() - 30 - $('#modal-control-body').outerHeight() - $("#next-control-body").outerHeight() - 20 - 30;   // 20 zospodu, 30 = 2*15 modal body padding
      def_roz_y =
        $("#modal-content-hladisko").outerHeight() -
        $("#modal-header").outerHeight() -
        $("#modal-control-body").outerHeight() -
        $("#next-control-body").outerHeight() -
        20;
    }
  }

  if (location.href.indexOf("iframe") != -1) {
    def_roz_y = 600;
  }

  if (is_mobile) def_roz_y = def_roz_y + 40;

  if (location.href.indexOf("iframe") != -1 && is_mobile) {
    def_roz_y = 400;
    $(".modalHladisko2 .kosik-box").css("bottom", "0px");
    $(".modalHladisko2 .kosik-box").css("position", "absolute");
    $(".modalHladisko2 .vyber-pocet-vst").css("bottom", "65px");
    $(".modalHladisko2 .vyber-pocet-vst").css("position", "absolute");
    $(".zoom-control").css("position", "absolute");
  }
  if (location.href.indexOf("iframe") != -1) {
    $(".modalHladisko2 .kosik-box").css("position", "absolute");
    $(".modalHladisko2 .vyber-pocet-vst").css("position", "absolute");
    $(".zoom-control").css("position", "absolute");

    var modal_height =
      $("#modal-content-hladisko .modal-header").outerHeight() +
      $("#modal-content-hladisko .modal-body.control-body").outerHeight() +
      $("#modal-content-hladisko .modal-body.next-control-body").outerHeight() +
      $("#modal-content-hladisko .modal-body.hladisko-body").outerHeight();
    $("#modal-content-hladisko").css("height", modal_height);
    $("#modal-content-hladisko").parent().css("height", modal_height);
    //$("#modal-content-hladisko").parent().parent().css("height", modal_height);
  }
}

function Velkost_Canvasu_oprav() {
  if (location.href.indexOf("iframe") != -1) {
    var modal_height =
      $("#modal-content-hladisko .modal-header").outerHeight() +
      $("#modal-content-hladisko .modal-body.control-body").outerHeight() +
      $("#modal-content-hladisko .modal-body.next-control-body").outerHeight() +
      $("#modal-content-hladisko .modal-body.hladisko-body").outerHeight();
    $("#modal-content-hladisko").css("height", modal_height);
    $("#modal-content-hladisko").parent().css("height", modal_height);
    //$("#modal-content-hladisko").parent().parent().css("height", modal_height);
  }
}

function MaBublinaPovSluzbu() {
  var kat = k_all[ukazujem_na_miesto[3]];
  var id_kat = ukazujem_na_miesto[3];
  var kat_ok = true;

  if (typeof k_nezobrazovat[ukazujem_na_miesto[3]] != "undefined")
    if (k_nezobrazovat[ukazujem_na_miesto[3]] != null)
      if (k_nezobrazovat[ukazujem_na_miesto[3]] == 0) kat_ok = false;

  var zobrazit = false;
  if (!drag) {
    if (ukazujem_na_miesto[1] != "" && ukazujem_na_miesto[1] != "|N|")
      zobrazit = true;
    if (
      zobrazMiesta[ukazujem_na_miesto[7]] !== undefined &&
      (zobrazMiesta[ukazujem_na_miesto[7]] !== undefined) != null
    )
      zobrazit = true;
  }

  if (
    (typeof _y == "undefined" || _y > 0) &&
    zobrazit &&
    kat_ok == true &&
    ((zobrazIbaSektor == true &&
      typeof MiestaVZobrazenomSektore[ukazujem_na_miesto[0]] != "undefined" &&
      MiestaVZobrazenomSektore[ukazujem_na_miesto[0]] != null) ||
      zobrazIbaSektor == false)
  ) {
    // treba zistit ci ide o sluzbu
    var ids = ukazujem_na_miesto[7];
    var idk = ukazujem_na_miesto[3];
    var masluzbu = false;
    if (isnull(povinne_sluzby[ids]) == false) {
      if (isnull(povinne_sluzby[ids][idk]) == false) {
        masluzbu = true;
      }
    }
    var id_sektor = ukazujem_na_miesto[7];

    if (masluzbu) {
      var cena_spolu = 0;
      for (var index = 0; index < povinne_sluzby[ids][idk].length; index++) {
        if (povinne_sluzby[ids][idk][index].ServiceDescription2 != "") {
          blokuj_posun = true;
          HTMl_sluzby.push(
            '<br /><a href="javascript:ZobrazPopisSluzby(' +
              ids +
              "," +
              idk +
              "," +
              index +
              ');" class="js-cd-panel-trigger" data-panel="main">' +
              lang["ViacInfo"] +
              " >></a>"
          );
        }

        cena_spolu += povinne_sluzby[ids][idk][index].ServicePrice;
      }
      return cena_spolu > 0;
    }
    return false;
  }
  return false;
}

function ZobrazBublinu(_x, _y, zobraz_btn) {
  if (
    posledne_ukazujem != null &&
    blokuj_posun &&
    ukazujem_na_miesto[0] == posledne_ukazujem[0]
  )
    return;

  blokuj_posun = false;

  var kat = k_all[ukazujem_na_miesto[3]];
  var id_kat = ukazujem_na_miesto[3];
  var kat_ok = true;

  if (typeof k_nezobrazovat[ukazujem_na_miesto[3]] != "undefined")
    if (k_nezobrazovat[ukazujem_na_miesto[3]] != null)
      if (k_nezobrazovat[ukazujem_na_miesto[3]] == 0) kat_ok = false;

  var zobrazit = false;
  if (!drag) {
    if (ukazujem_na_miesto[1] != "" && ukazujem_na_miesto[1] != "|N|")
      zobrazit = true;
    if (
      zobrazMiesta[ukazujem_na_miesto[7]] !== undefined &&
      (zobrazMiesta[ukazujem_na_miesto[7]] !== undefined) != null
    )
      zobrazit = true;
  }

  if (
    (_y > 0 || is_mobile) &&
    zobrazit &&
    kat_ok == true &&
    ((zobrazIbaSektor == true &&
      typeof MiestaVZobrazenomSektore[ukazujem_na_miesto[0]] != "undefined" &&
      MiestaVZobrazenomSektore[ukazujem_na_miesto[0]] != null) ||
      zobrazIbaSektor == false)
  ) {
    document.body.style.cursor = "pointer";
    $root = $("#rootPopisMiesta");
    $sluzby = $("#rootPopisMiesta #sluzby");
    $root[0].style.display = "";

    // treba zistit ci ide o sluzbu
    var ids = ukazujem_na_miesto[7];
    var idk = ukazujem_na_miesto[3];
    var masluzbu = false;
    if (isnull(povinne_sluzby[ids]) == false) {
      if (isnull(povinne_sluzby[ids][idk]) == false) {
        masluzbu = true;
      }
    }

    var verzia = 1;
    var css_bubliny = "bubble-sm";

    if (masluzbu) {
      css_bubliny = "bubble-lg";
    }
    if (
      masluzbu &&
      povinne_sluzby[ids][idk][0].ServiceDescription.indexOf("<!--2-->") != -1
    ) {
      verzia = 2;
      css_bubliny = "bubble-lg";
    }
    if (
      masluzbu &&
      povinne_sluzby[ids][idk][0].ServiceDescription.indexOf("<!--3-->") != -1
    ) {
      verzia = 3;
      sirka_bubliny = "bubble-xxl";
    }
    if (g_performance.Resale.Seats[ukazujem_na_miesto[0]] != null)
      css_bubliny = "bubble-lg";

    if ($root.hasClass(css_bubliny) == false) {
      $root.removeClass("bubble-sm");
      $root.removeClass("bubble-lg");
      $root.removeClass("bubble-xxl");
      $root.addClass(css_bubliny);
    }

    $sluzby[0].style.display = "none";

    var id_sektor = ukazujem_na_miesto[7];

    var maNastavenieSektory = false;
    if (g_performance.SectorsSettings != null)
      for (var ids in g_performance.SectorsSettings) {
        maNastavenieSektory = true;
        break;
      }

    var HTMl_sluzby = new Array();

    if (maNastavenieSektory) {
      for (var ids in g_performance.SectorsSettings) {
        if (ids == id_sektor && g_performance.SectorsSettings[ids] == 1) {
          HTMl_sluzby.push("<div class='item note'>");
          HTMl_sluzby.push(
            "  <p  class='' style='color:#E01B16'>" +
              lang["VsetkySektoryInfo"] +
              "</p>"
          );
          HTMl_sluzby.push("</div>");
          break;
        }
      }
    }

    var jeZTP = false;

    if (
      g_performance.PriceCategories[id_kat].Description != null &&
      g_performance.PriceCategories[id_kat].Description != ""
    ) {
      if (
        g_performance.PriceCategories[id_kat].Description.indexOf("ZTPWWW") !=
        -1
      ) {
        jeZTP = true;
      }

      HTMl_sluzby.push("<div class='item note'>");
      HTMl_sluzby.push(
        "  <p  class='' style='color:#E01B16'>" +
          g_performance.PriceCategories[id_kat].Description.replace(
            "ZTPWWW",
            ""
          ) +
          "</p>"
      );
      HTMl_sluzby.push("</div>");
    }

    if (masluzbu) {
      HTMl_sluzby.push('<div class="item note">');
      HTMl_sluzby.push(
        '    <div id="sluzba-nazov" class="title">' +
          lang["lbDostupneIba"] +
          "</div>"
      );
      HTMl_sluzby.push("</div>");

      var cena_spolu = k_all[ukazujem_na_miesto[3]][2];
      for (var index = 0; index < povinne_sluzby[ids][idk].length; index++) {
        HTMl_sluzby.push('<div class="item note">');
        HTMl_sluzby.push(
          '    <div id="sluzba-nazov" class="title">' +
            povinne_sluzby[ids][idk][index].ServiceName +
            "</div>"
        );
        HTMl_sluzby.push(
          '    <p id="sluzba-popis" class="">' +
            povinne_sluzby[ids][idk][index].ServiceDescription +
            "</p>"
        );
        HTMl_sluzby.push(
          '    <p id="sluzba-cena" class="text-nowrap text-right"><b>+' +
            Format_mena(povinne_sluzby[ids][idk][index].ServicePrice) +
            "</b>"
        );

        if (povinne_sluzby[ids][idk][index].ServiceDescription2 != "") {
          blokuj_posun = true;
          HTMl_sluzby.push(
            '<br /><a href="javascript:ZobrazPopisSluzby(' +
              ids +
              "," +
              idk +
              "," +
              index +
              ');" class="js-cd-panel-trigger" data-panel="main">' +
              lang["ViacInfo"] +
              " >></a>"
          );
        }
        HTMl_sluzby.push("</p>");

        HTMl_sluzby.push("</div>");

        cena_spolu += povinne_sluzby[ids][idk][index].ServicePrice;
      }

      HTMl_sluzby.push('<div class="item note">');
      HTMl_sluzby.push(
        '    <p id="sluzba-cena" class="text-nowrap text-right"><b>' +
          lang["lbSpolu"] +
          ": " +
          Format_mena(cena_spolu) +
          "</b></p>"
      );
      HTMl_sluzby.push("</div>");

      if (
        typeof zobraz_btn != "undefined" &&
        zobraz_btn != null &&
        zobraz_btn
      ) {
        HTMl_sluzby.push('<div class="item note">');
        HTMl_sluzby.push(
          '    <p id="sluzba-cena" class="text-nowrap"><div style="display:inline"><button type="button" class="btn btn-danger" onclick="ZrusitPosledneMiesto();">' +
            lang["zrusit"] +
            '</button></div><div style="display:inline;float:right"><button type="button" onclick="$(\'#rootPopisMiesta\').css(\'display\',\'none\');" class="btn btn-success" onclick="">' +
            lang["potvrdit"] +
            "</button></div></p>"
        );
        HTMl_sluzby.push("</div>");
      }
    }

    if (g_performance.Resale.Seats[ukazujem_na_miesto[0]] != null) {
      HTMl_sluzby.push('<div class="item note">');
      HTMl_sluzby.push(
        '    <div id="sluzba-nazov" class="title">' +
          lang["Resale_manipulacny_poplatok"] +
          "</div>"
      );
      HTMl_sluzby.push(
        '    <p id="sluzba-cena" class="text-nowrap text-right"><b>+' +
          Format_mena(
            g_performance.Resale.Seats[ukazujem_na_miesto[0]].Poplatok
          ) +
          "</b>"
      );
      HTMl_sluzby.push("</p>");
      HTMl_sluzby.push("</div>");
      //cena_spolu += povinne_sluzby[ids][idk][index].ServicePrice;
    }

    if (HTMl_sluzby.length == 0) {
      var st_ = 2;
      st_ = m[ukazujem_na_miesto[0]][1];

      $root.removeClass("bubble-lg");
      $root.removeClass("bubble-xxl");
      if ($root.hasClass("bubble-sm") == false) $root.addClass("bubble-sm");
      $sluzby.removeClass("show");

      /*if (st_ == 1) { }
            else {
                if (document.getElementById("sluzby") != null)
                    document.getElementById("sluzby").style.display = "none";
            }*/
    } else {
      $sluzby.addClass("show");
      $("#sluzby").html(HTMl_sluzby.join(""));
    }

    var sirka_bubliny = 200;
    if ($root.hasClass("bubble-lg")) sirka_bubliny = 350;
    if ($root.hasClass("bubble-xxl")) sirka_bubliny = 500;

    if (is_mobile) {
      $root[0].style.left = "0px";
      $root[0].style.top = "0px";
      $root[0].style.margin = "10px";
    } else {
      if (_x < def_roz_x - sirka_bubliny)
        $root[0].style.left = _x + 20 + (masluzbu ? -15 : 0) + "px";
      else
        $root[0].style.left = _x - sirka_bubliny + (masluzbu ? -40 : 0) + "px";

      var pozicia_y_bubliny = 0;

      if (_y < def_roz_y - 150) {
        $root[0].style.top = _y + 10 + (masluzbu ? -15 : 0) + "px";
        pozicia_y_bubliny = _y + 10 + (masluzbu ? -15 : 0);
      } else {
        $root[0].style.top = _y - 120 + "px";
        pozicia_y_bubliny = _y - 120;
      }
    }

    document.getElementById("infoMiesto").innerHTML = ukazujem_na_miesto[1];
    document.getElementById("infoRad").innerHTML = ukazujem_na_miesto[2];
    document.getElementById("infoSektor").innerHTML =
      s_all[ukazujem_na_miesto[7]];

    var st = 2;
    st = m[ukazujem_na_miesto[0]][1];

    var langVolne = lang["Volne"];
    var langDocasneObsadene = lang["DocastneObsadene"];
    var langObsadene = lang["Obsadene"];

    var stav =
      st == 0 ? langVolne : st == 1 ? langDocasneObsadene : langObsadene;
    if (jeZTP) stav = "OFFLINE ORDER";

    document.getElementById("infoStav").innerHTML = stav;

    if (typeof k_all[ukazujem_na_miesto[3]] != "undefined") {
      document.getElementById("infoKategoria").innerHTML =
        k_all[ukazujem_na_miesto[3]][1];

      if (g_performance.Resale.Seats[ukazujem_na_miesto[0]] != null) {
        document.getElementById("infoCena").innerHTML = Format_mena(
          g_performance.Resale.Seats[ukazujem_na_miesto[0]].Cena
        );
      } else {
        if (
          typeof k_all[ukazujem_na_miesto[3]][2] != "undefined" &&
          k_all[ukazujem_na_miesto[3]][2] != -1
        )
          document.getElementById("infoCena").innerHTML =
            k_all[ukazujem_na_miesto[3]][2] == 9999
              ? "-"
              : Format_mena(k_all[ukazujem_na_miesto[3]][2]);
        else document.getElementById("infoCena").innerHTML = "-";
      }
    } else {
      document.getElementById("infoKategoria").innerHTML = "-";
      document.getElementById("infoCena").innerHTML = "-";
    }

    if (pozicia_y_bubliny + $("#rootPopisMiesta").height() > def_roz_y) {
      pozicia_y_bubliny = def_roz_y - $("#rootPopisMiesta").height() - 20;
      document.getElementById("rootPopisMiesta").style.top =
        pozicia_y_bubliny + "px";
    }

    bublina_zatvorena = false;
    DrawSedadlo(ukazujem_na_miesto);
    posledne_ukazujem = ukazujem_na_miesto;
  }
}

function ZobrazPopisSluzby(ids, idk, index) {
  var ps = povinne_sluzby[ids][idk][index];
  $("#cd-sluzba-nazov").html(ps.ServiceName);
  $("#cd-sluzba-popis").html(ps.ServiceDescription2);
  $("#cd-sluzba-cena").html(Format_mena(ps.ServicePrice));

  $(".js-cd-panel-main").addClass("cd-panel--is-visible");
}

var posledne_ukazujem = null;
var bublina_zatvorena = true;
var blokuj_posun = false;
var bublinu_zatvaram = false;

function ZavryBublinu() {
  /*if (posledne_ukazujem != null) {
        console.log("posledne ukazujem");
        premaz_miesto = true;
        DrawSedadlo(posledne_ukazujem);
        posledne_ukazujem = null;
        premaz_miesto = false;
    }*/

  bublina_zatvorena = true;
  document.body.style.cursor = "default";

  //PrekresliCanvas();
  /*if (posledne_ukazujem != null) {
        premaz_miesto = true;
        DrawSedadlo(posledne_ukazujem);
        posledne_ukazujem = null;
        premaz_miesto = false;
    }*/

  bublinu_zatvaram = true;
  setTimeout("ZavryBublinu2()", blokuj_posun ? 600 : 300);
}

function ZavryBublinu2() {
  if (bublina_zatvorena && bublinu_zatvaram == true) {
    if (document.getElementById("rootPopisMiesta").style.display != "none") {
      document.getElementById("rootPopisMiesta").style.display = "none";
    }
  }
  bublinu_zatvaram = false;
}

// Asi nebude treba v goticket
function QuickPurcharseInit() {
  if (typeof isQuickPurcharse != "undefined" && isQuickPurcharse == true) {
    $("#hladisko-basket-btn").attr(
      "href",
      "javascript:$('#modalHladisko').modal('hide');"
    );
    $("#hladisko_basket_2").attr(
      "href",
      "javascript:$('#modalHladisko').modal('hide');"
    );

    if (getDocWidth() > 500)
      $("#hladisko-basket-btn span.text").html(lang["RychlyNakup_Pokracuj"]);

    if ($("#vyber-sedenia-hladisko").html() == "")
      $("#vyber-sedenia-hladisko").html(
        '<table class="table table-hover table-bordered1 table-miesta"><tbody><tr><td colspan="1" class="pridaj-miesto"><button class="btn btn-default" type="button"><i class="fa fa-plus"></i> ' +
          lang["RychlyNakup_Pridaj"] +
          "</button></td></tr></tbody></table>"
      );
  }
}

// Asi nebude treba v goticket
function ui_init() {
  if (__ismobile__ && $(window).height() < 767)
    $("#modalHladisko #modal-header").addClass("lower-height");

  //if ($(window).height() < 767 && $(window).width() < 1000)
  //    $("#modalHladisko #modal-header").addClass("hidden");
  //else
  //    $("#modalHladisko #modal-header").removeClass("hidden");
}
