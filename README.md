# JTube
JavaScript library for YouTube API v3. 

Example:This example get titles of all videos you uploaded. 

<script src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
<script src="JTube.js"></script>
<script>
var client_id="300391029103000-ns0c5tdneulj3bucti9gbltggfsl6mvr.apps.googleusercontent.com";
var client_secret ="kUahieVfDhW536FW4rv8eyggGB";
var redirect_url ="http://localhost/redirect.php";
//This parameter is optional.(Default scope is "https://www.googleapis.com/auth/youtube") 
var scope="https://www.googleapis.com/auth/youtube.upload" 
var jtube = new JTube(client_id,client_secret,redirect_url,scope);
jtube.getMyVideoTitleAll(function(titles){
   console.log(titles);
});
</script>

Result:(array)
["title1","title2","title3".....]
