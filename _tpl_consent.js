<script>
/* Consent-gated analytics (WP3/T004) — active: <html data-ga-id="G-M5C9K1JWH4">
   (GA4 web stream "Nelurio Platform", 15842112317). GDPR/TTDSG: consent mode v2
   defaults denied; no script before opt-in. */
(function(){
  const KEY = 'analytics_consent';
  const banner = document.getElementById('consentBanner');
  let injected = false;
  function inject(){
    if (injected) return;
    const id = document.documentElement.getAttribute('data-ga-id');
    if (!id) return;
    injected = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      analytics_storage: 'denied', wait_for_update: 500
    });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', id);
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
  }
  function decide(v){
    try{ localStorage.setItem(KEY, v); }catch(e){}
    banner.hidden = true;
    if (v === 'granted') inject();
  }
  window.initAnalytics = function(){
    const id = document.documentElement.getAttribute('data-ga-id');
    if (!id) return;
    let c = null; try{ c = localStorage.getItem(KEY); }catch(e){}
    if (c === 'granted') inject();
    else if (c !== 'denied') banner.hidden = false;
  };
  document.getElementById('consent-accept').addEventListener('click', ()=>decide('granted'));
  document.getElementById('consent-decline').addEventListener('click', ()=>decide('denied'));
  window.initAnalytics();
})();
</script>