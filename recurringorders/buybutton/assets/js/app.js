function handleProductData(data){
	productData = JSON.parse(data);
}

function getProductData(myshopify_url, page){
	httpGetAsync("https://" + myshopify_url + "/collections/all-products/products.json?page=" + page, handleProductData);
}

function httpGetAsync(url, callback=function(){})
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", url, true);
	xmlHttp.send(null);
}

function triggerChange(element){
	if ("createEvent" in document) {
	    var evt = document.createEvent("HTMLEvents");
	    evt.initEvent("change", false, true);
	    element.dispatchEvent(evt);
	}
	else{
	    element.fireEvent("onchange");
	}
}

function loadWidget(c) {
  var d = document, t = 'script',
      o = d.createElement(t),
      s = d.getElementsByTagName(t)[0];
  o.src = "https://ro.boldapps.net/recurring_settings/generate_rp?&shop_url=" + myshopify_domain + "&group_id=" + active_group_id + "&product_id=" + active_product_id + "&variant_id=" + active_variant_id + "&v=2";
  if (c) { o.addEventListener('load', function (e) { c(null, e); }, false); }
  var product_form = document.getElementById('product-form');
  var rp_div = product_form.querySelector('.product_rp_div');
  rp_div.className += " p" + active_product_id;
  rp_div.insertBefore(o, rp_div.firstChild);
}

function useProduct(product_el){
	var product_id = product_el.dataset.productId;
	var product_title = productData[product_id].title;
	var featured_image = productData[product_id].featured_image;

	active_product_id = product_id;
	active_product_title = product_title;
	active_featured_image = featured_image;

	document.getElementById('progress-1').style.display = 'none';
	document.getElementById('complete-1').style.display = 'inline-block';
	document.getElementById('select-prod').innerHTML = 'Change Product';

	displayProductVariants(product_id);
	overlay('overlay', function(){
		overlayShow('variant-select', function(){
			backToStep2();
		});
	});
}

function exists(element){
	return typeof element !== 'undefined';
}

function backToStep2(){
	document.getElementById('select-variant').style.display = 'block';
	document.getElementById('finalize').style.display = 'block';

	var discounted_price_el = document.getElementById('variant-discounted-price-display');
	if(exists(discounted_price_el)){
		discounted_price_el.innerHTML = '';
	}
	overlayHide('subscription-details', function(){
		overlayHide('terms', function(){
			overlayHide('get-codes', function(){
			});
		});
	});
}

function finalize(){

	document.getElementById('progress-3').style.display = 'none';
	document.getElementById('complete-3').style.display = 'inline-block';
	document.getElementById('finalize').style.display = 'none';
	overlay('terms', function(){
		overlay('get-codes', function(){

		});
	});

}

function updateGlobals(){

	var rp_div = document.querySelector('.product_rp_div.p' + active_product_id);
	var discount_percentage_el = rp_div.querySelector('.discount_percentage');
	var discounted_price_el = document.getElementById('discounted_price_val');

	active_discount_percentage = parseInt(exists(discount_percentage_el)?discount_percentage_el.innerHTML.replace('%',''):'0');
	active_discounted_price = discounted_price_el.innerHTML;
	active_unformatted_discounted_price = (active_variant_price * 100) * ((100-active_discount_percentage)/100) / 100;

}

function fetchSubscriptionDetails(){

	document.getElementById('progress-2').style.display = 'none';
	document.getElementById('complete-2').style.display = 'inline-block';
	document.getElementById('select-variant').style.display = 'none';

    $('script').each(function() {
        if (this.src === 'https://ro.boldapps.net/assets_embed/js/bold.js') {
          this.parentNode.removeChild( this );
        }
        else if(this.src === 'https://ro.boldapps.net/app_assets/js/bootstrap_tooltip.js'){
        	this.parentNode.removeChild( this );
        }
    });

	overlayShow('subscription-details');

	var frequency_num_display_el = document.getElementById('frequency_num');
	var frequency_type_display_el = document.getElementById('frequency_type');
	frequency_num_display_el.innerHTML = '';
	frequency_type_display_el.innerHTML = '';

	loadWidget(function(){
		
		var rp_div = document.querySelector('.product_rp_div.p' + active_product_id);
		var frequency_num_el = rp_div.querySelector('.frequency_num');
		var frequency_type_el = rp_div.querySelector('.frequency_type');

		if(exists(rp_div.querySelector('.new_discounted_price'))){
			document.getElementById('variant-discounted-price-display').innerHTML = 'Discounted Price: <span id="discounted_price_val">' + rp_div.querySelector('.new_discounted_price').innerHTML + '</span>';
		}
		else{
			document.getElementById('variant-discounted-price-display').innerHTML = 'Discounted Price: <span id="discounted_price_val">' + Shopify.formatMoney(active_variant_price, productData[active_product_id].money_format) + '</span>';
		}

		if(frequency_num_el.tagName.toLowerCase() == 'input'){
			frequency_num_display_el.innerHTML = '<option value="' + frequency_num_el.value + '">' + frequency_num_el.value + '</option>';
		}else{
			var options = [].slice.call(frequency_num_el.children);
			frequency_num_display_el.innerHTML = "";
			options.forEach(function(option, index){
				var o = document.createElement('option');
				o.value = option.value;
				o.innerHTML = option.innerHTML;
				frequency_num_display_el.appendChild(o);
			});
		}

		if(frequency_type_el.tagName.toLowerCase() == 'input'){
			var freq_lang = [];
			freq_lang[1] = 'Day(s)';
			freq_lang[2] = 'Week(s)';
			freq_lang[3] = 'Month(s)';
			freq_lang[5] = 'Year(s)';
			frequency_type_display_el.innerHTML = '<option value="' + parseInt(frequency_type_el.value) + '">' + freq_lang[parseInt(frequency_type_el.value)] + '</option>';
		}else{
			var options = [].slice.call(frequency_type_el.children);
			frequency_type_display_el.innerHTML = "";
			options.forEach(function(option, index){
				var o = document.createElement('option');
				o.value = option.value;
				o.innerHTML = option.innerHTML;
				frequency_type_display_el.appendChild(o);
			});
		}

		updateGlobals();

	});

}

function displayProductVariants(product_id){

	var variant_select_el = document.getElementById('variant-id');
	variant_select_el.innerHTML = '';
	var keys = Object.keys(productData[product_id].variants);
	for(var i=0;i<keys.length;i++){

		var option = document.createElement('option');
		option.value= keys[i];
		option.innerHTML = productData[product_id].variants[keys[i]].title;
		variant_select_el.appendChild(option);

	}

	active_variant_title = productData[product_id].variants[keys[0]].title;
	active_variant_id = keys[0];
	active_group_id = productData[product_id].variants[keys[0]].group_id;
	active_variant_price = productData[product_id].variants[keys[0]].price;

	document.getElementById('product-image-display').src = active_featured_image;
	document.getElementById('product-title-display').innerHTML = active_product_title;
	document.getElementById('variant-title-display').innerHTML = active_variant_title;
	document.getElementById('variant-price-display').innerHTML = 'Regular Price: ' + Shopify.formatMoney(active_variant_price, productData[active_product_id].money_format);

}

function displayPreviousPage(){
	if(current_page>1){
		current_page--;
		displayProductCards(current_page);
	}
}

function displayNextPage(){
	if((current_page+1)<=last_page){
		current_page++;
		displayProductCards(current_page);
	}
}

function getCode(){
	var frequency_num = document.getElementById('frequency_num').value;
	var frequency_type = document.getElementById('frequency_type').value;
	var code = "https://" + myshopify_domain + "/pages/quick-subscribe?p=" + active_product_id + "&v=" + active_variant_id + "&g=" + active_group_id + "&fn=" + frequency_num + "&ft=" + frequency_type + "&dp=" + active_discounted_price + "&rdp=" + active_discount_percentage + "&rup=" + active_unformatted_discounted_price;
	alert('Your subscribe link is: ' + code);
}

function displayProductCards(page){

	document.querySelector('.product-cards').innerHTML = "";
	var keys = Object.keys(productData);
	for(var i=(page-1)*15;i<keys.length && i<((page-1)*15)+15;i++){

		var product_id = keys[i];
		var product_title = productData[product_id].title;
		var featured_image = productData[product_id].featured_image;
		var product_card_el = document.querySelector('.product-cards');
		var new_card_html = document.getElementById('product-card-template').innerHTML;
		new_card_html = new_card_html.replace('{{product_id}}', product_id);
		new_card_html = new_card_html.replace('{{product_title}}', product_title);
		new_card_html = new_card_html.replace('{{featured_image}}', featured_image);

		var new_element = document.createElement('div');
		new_element.innerHTML = new_card_html;
		new_element.dataset.productId = product_id;

		updateCurrentPage();

		product_card_el.appendChild(new_element);
	}

}

function getProductDataFromPage(callback){
	httpGetAsync("https://" + myshopify_domain + "/pages/ro-get-products", function(response){
		productData = JSON.parse(response);
		callback(productData);
	});
}

function overlayShow(elementClass, callback){
	el = document.getElementsByClassName(elementClass)[0];
	el.style.display = "block";
	el.style.opacity = "1";
	if(typeof(callback) == 'function'){
		callback();
	}
}

function updateCurrentPage(){
	var elements = [].slice.call(document.getElementsByClassName('page-num'));
	elements.forEach(function(el, index){

		el.innerHTML = current_page;

	});
}

function overlayHide(elementClass, callback){
	el = document.getElementsByClassName(elementClass)[0];

	el.style.opacity = "0";
	el.style.display = "none";

	if(typeof(callback) == 'function'){
		callback();
	}
}

function overlay(elementClass, callback) {
	elements = [].slice.call(document.getElementsByClassName(elementClass));
	elements.forEach(function(el, index){
		if(isHidden(el)){
			el.style.display = "block";
			setTimeout(function(){
				el.style.opacity = "1";
			}, 200);
		}
		else{
			el.style.opacity = "0";
			setTimeout(function(){
				el.style.display = "none";
			}, 300);
		}
	});
	setTimeout(function(){
		if(typeof(callback) == 'function'){
			callback();
		}
	}, 400);

}

function isHidden(el) {
    return (el.offsetParent === null);
}

function extractDomain(url) {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}