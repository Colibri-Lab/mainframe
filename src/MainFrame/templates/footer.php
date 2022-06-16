<?php
use Colibri\App;
if(App::$domainKey === 'manage') {
?>
    <script>
        App.InitializeApplication(
            Colibri.Web.Router.RouteOnHash, 
            Colibri.IO.Request.RequestEncodeTypeEncrypted, 
            false, 
            true,
            location.protocol + '//' + location.host
        );
    </script>
<?php
}
?>