{{~#if uniqid~}}
	<h3>{{uniqid}}</h3>
{{~/if~}}
{{~#if logo~}}
    <div class="logo">
        <img src="{{logo}}" alt="{{__ "Logo"}}" />
    </div>
{{~/if~}}
{{~#if title~}}
    <h1>{{title}}</h1>
{{~/if~}}
{{~#if subtitle~}}
    <h2>{{subtitle}}</h2>
{{~/if~}}
{{~#if date~}}
    <h3>{{date}}</h3>
{{~/if~}}
{{~#if qrcode~}}
    <div class="qr-code"></div>
{{~/if~}}
