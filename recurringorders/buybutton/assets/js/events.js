document.querySelector(".overlay__inner").addEventListener("click", function(event){
	event.stopPropagation();
});

document.querySelector(".overlay").addEventListener("click", function(event){
	overlay("overlay");
});

document.querySelector(".btn-go-shopify").addEventListener("click", function(event){
	var domain = extractDomain(document.getElementById('myshopify').value);
	if(domain.indexOf('.myshopify.com') !== -1){
		myshopify_domain = domain;
		overlay('who-are-you', function(){
			overlay('loading');
			getProductDataFromPage(function(productData){

				num_products = Object.keys(productData).length;
				last_page = Math.ceil(num_products / 15.0);
				current_page = 1;

				overlay('loading', function(){
					displayProductCards(1, productData);
					overlay('product-cards-info');
					overlay('product-cards');
					updateCurrentPage();
					overlay('page-nav');
				});
			});
		});
	}
	else{
		alert("Please enter a valid myshopify domain found in the URL of your Shopify admin.");
	}
});

document.querySelector('#variant-id').addEventListener('change', function(){

	active_variant_id = this.value;
	active_variant_title = this.options[this.selectedIndex].innerHTML;
	active_variant_price = productData[active_product_id].variants[active_variant_id].price;
	document.getElementById('variant-title-display').innerHTML = active_variant_title;
	document.getElementById('variant-price-display').innerHTML = 'Regular Price: ' + Shopify.formatMoney(active_variant_price, productData[active_product_id].money_format);
	backToStep2();

});