<?php
use Colibri\App;
if(App::$domainKey === 'manage') {
?>
    <script>
        App.InitializeApplication(
            'manage',
            1,
            Colibri.Web.Router.RouteOnHash, 
            Colibri.IO.Request.RequestEncodeTypeEncrypted, 
            true, 
            true,
            location.protocol + '//' + location.host,
            'ru-RU',
            'ru-RU',
            {
                code: 'RUB',
                symbol: '₽'
            }
        );
    </script>
<?php
}
?>