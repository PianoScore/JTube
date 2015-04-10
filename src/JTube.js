function JTube(client_id,client_secret,redirect_url,scope){
    this.client_id=client_id;
    this.client_secret=client_secret;
    this.redirect_url=redirect_url;
    this.url="https://www.googleapis.com/youtube/v3/";
    this.authInfo;
    this.scope=scope?scope:'https://www.googleapis.com/auth/youtube';
    
}
JTube.prototype={
    List:function(apiName,data,callback){
        var t=this;
        if(!t.authInfo || t.getAccessTokenExpire()*1000 < +new Date()){
            t.auth(function(){
                t.List(apiName,data,callback);
            });
        }else{
            $.ajax({
                url:t.url+apiName,
                data:data,
                headers:{authorization:"Bearer "+t.authInfo.access_token},
                contentType:"application/json; charset=utf-8",
                dataType:"json"
            }).then(function(res){
                //res=JSON.parse(res);
                callback(res);
            })
        }
    },
    Update:function(apiName,data,callback){
        var t=this;
        if(!t.authInfo || t.getAccessTokenExpire()*1000 < +new Date()){
            t.auth(function(){
                t.List(apiName,data,callback);
            });
        }else{
            $.ajax({
                url:t.url+apiName,
                data:JSON.stringify(data),
                headers:{authorization:"Bearer "+t.authInfo.access_token},
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                method:"PUT"
            }).then(function(res){
                if(callback) callback(res);
            })
        }
    },
    getMyVideoItemsAll:function(callback){
        var t=this;
        var reqestdata={
            part:"snippet",
            forMine:true,
            maxResults:50,
            type:"video"
        }
        request(reqestdata);
        function request(data,items){
            t.List("search",data,function(res){
                if(!items) items=[];
                if(res.items && res.items.length>0){
                    items=$.merge(items,res.items);
                }
                //if results more than 50 and items < total
                if(res.nextPageToken && items.length<res.pageInfo.totalResults){
                    data.pageToken=res.nextPageToken;
                    request(data,items);
                }else{
                    if(callback) callback(items);
                }
                    
            });
        }
        
        
    },
    getMyVideoTitleAll:function(callback){
        var titles=[];
        this.getMyVideoItemsAll(function(items){
            $.each(items,function(i,item){
                titles.push(item.snippet.title);
            })
            callback(titles);
        });
        
    },    
    getMyVideoTitleAndIdAll:function(callback){
        var nameAndId=[];
        this.getMyVideoItemsAll(function(items){
            $.each(items,function(i,item){
                nameAndId.push({id:item.id.videoId,title:item.snippet.title});
            })
            callback(nameAndId);
        });
        
    },
    getVideoThumbnailsByID:function(id,callback){
        this.getVideoItemByID(id,function(item){
           callback(item.snippet.thumbnails); 
        });
    },
    getVideoDescriptionByID:function(id,callback){
        this.getVideoItemByID(id,function(item){
           callback(item.snippet.description); 
        });
    },
    getVideoPublishedAtByID:function(id,callback){
        this.getVideoItemByID(id,function(item){
           callback(item.snippet.publishedAt); 
        });        
    },
    getVideoChannnelIdByID:function(id,callback){
        this.getVideoItemByID(id,function(item){
           callback(item.snippet.channelId); 
        });             
    },
    getVideoChannelTitleByID:function(id,callback){
        this.getVideoItemByID(id,function(item){
           callback(item.snippet.channelTitle); 
        });             
    },    
    updateVideoTitle:function(id,title,callback){
        var t=this;
        //get video snip
        t.getVideoItemByID(id,function(item){
            if(item){
                //update title
                item.snippet.title=title;
                t.Update("videos?part=snippet",item,function(res){
                    if(callback) callback(res);
                });
            }
        });
    },
    addTags:function(id,tag,callback){
        var t=this;
        //get video snip
        t.getVideoItemByID(id,function(item){
            if(item){
                //update title
                if($.isArray(tag)){
                   item.snippet.tags= $.merge(item.snippet.tags,tag);
                }else{
                    item.snippet.tags.push(tag);
                }
                t.Update("videos?part=snippet",item,function(res){
                    if(callback) callback(res);
                });
            }
        });        
    },
    updateTags:function(id,tag,callback){
        var t=this;
        //get video snip
        t.getVideoItemByID(id,function(item){
            if(item){
                //update title
                if($.isArray(tag)){
                   item.snippet.tags= tag;
                }else{
                    item.snippet.tags=[tag];
                }
                t.Update("videos?part=snippet",item,function(res){
                    if(callback) callback(res);
                });
            }
        });            
    },
    updateSnippet:function(item,callback){
        var t=this;

        t.Update("videos?part=snippet",item,function(res){
            if(callback) callback(res);
        });
         
    },
    getVideoItemByID:function(videoId,callback){
           var data={
               id:videoId,
               part:"snippet"
           }
        this.List("videos",data,function(res){
            var item=null
            if(res.items){
                item=res.items[0];
            }
            if(callback) callback(item);
        });
    },
    getAccessToken:function(){
        return this.authInfo?this.authInfo.access_token:false;
    },
    getAccessTokenExpire:function(){
        return this.authInfo?this.authInfo.expires_at:false;
    },
    getScopes:function(){
        return this.authInfo?this.authInfo.scope.split(/\s/):false;
    },  
    getClientId:function(){
        return this.client_id;
    },
    getClientSecret:function(){
        return this.client_secret;
    },
    getMyPlayLists:function(callback){
           var data={
               part:"snippet",
               mine:true
           }
        this.List("playlists",data,function(res){
            var item=null
            if(res.items){
                item=res.items[0];
            }
            if(callback) callback(item);
        });
    },
    getPlayListsByID:function(id,callback){
           var data={
               part:"snippet",
               id:id
           }
        this.List("playlists",data,function(res){
            var item=null
            if(res.items){
                item=res.items[0];
            }
            if(callback) callback(item);
        });        
    },
    getPlayListItemByID:function(id,callback){
           var data={
               part:"snippet",
               playlistId:id,
               maxResults:50
           }
        this.List("playlistItems",data,function(res){
            var items=null
            if(res.items){
                items=res.items;
            }
            if(callback) callback(items);
        });             
    },
    auth:function(callback){
            var t=this;
            var error_count=0;
            var current_time=+new Date();
            window["jtube"+current_time]=checkAuth;
            if(!window.gapi){
                $.ajax({
                    url:"https://apis.google.com/js/client.js?onload=jtube"+current_time,
                    async:false,
                    dataType:"script"
                }).then(function(){
                            //gapi.client.setApiKey(t.client_secret);
                           // window.setTimeout(checkAuth,1);
                            //clearInterval(interval);
                        });
            }else{
                gapi.client.setApiKey(t.client_secret);
                checkAuth();
            }

            function checkAuth() {
              gapi.client.setApiKey(t.client_secret);
              setTimeout(function(){
                gapi.auth.authorize({client_id: t.client_id, scope: t.scope, immediate: true}, handleAuthResult);
              },1);
            }
            
            function handleAuthResult(authResult) {
              if (authResult && !authResult.error) {
                t.authInfo=authResult;
                delete window["jtube"+current_time];
                if(callback) callback();
              } else {
                //prevent permanentaly loop 
                if(error_count>5) return;
                gapi.auth.authorize({client_id: t.clientId, scope: t.scope, immediate: false}, handleAuthResult);
                error_count++;
              }
            }
    }
}
