<?php
use Colibri\App;
if(App::$domainKey === 'manage') {
?>
    <script>
        App.InitializeApplication(
            Colibri.Web.Router.RouteOnHash, 
            Colibri.IO.Request.RequestEncodeTypeEncrypted, 
            true, 
            true,
            location.protocol + '//' + location.host
        );
    </script>
<?php
}
?>