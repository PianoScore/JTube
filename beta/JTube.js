/**
 * 
 * @param {type} client_id
 * @param {type} client_secret
 * @param {type} redirect_url
 * @class JTube
 * @constructor
 */
function JTube(client_id,client_secret,redirect_url,scope){
    this.client_id=client_id;
    this.client_secret=client_secret;
    this.redirect_url=redirect_url;
    this.url="https://www.googleapis.com/youtube/v3/";
    this.authInfo;
    this.scope=scope?scope:'https://www.googleapis.com/auth/youtube';
    
}
JTube.prototype={
    /** 
     * Use List type api
     * 
     * @method List
     * @param {String} apiName
     * @param {Object} data 
     * @param {Function} callback 
     */
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
     /** 
      * Use Update type api
      * 
     * @method Update
     * @param {String} apiName
     * @param {Object} data 
     * @param {Function} callback 
     */
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
    /** 
     * Get videos you uploaded
     * 
     * @method getMyVideoItemsAll
     * @param {Function} callback 
     */    
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
    /** 
     * Get all videos title you uploaded
     * 
     * @method getMyVideoTitleAll
     * @param {Function} callback 
     */        
    getMyVideoTitleAll:function(callback){
        var titles=[];
        this.getMyVideoItemsAll(function(items){
            $.each(items,function(i,item){
                titles.push(item.snippet.title);
            })
            callback(titles);
        });
        
    },
    /** 
     * Get all videos title and id you uploaded
     * 
     * @method getMyVideoTitleAndIdAll
     * @param {Function} callback 
     */   
    getMyVideoTitleAndIdAll:function(callback){
        var nameAndId=[];
        this.getMyVideoItemsAll(function(items){
            $.each(items,function(i,item){
                nameAndId.push({id:item.id.videoId,title:item.snippet.title});
            })
            callback(nameAndId);
        });
        
    },
    /** 
     * Get video thmbnails
     * 
     * @method getVideoThumbnailsByID
     * @param {String} videoId
     * @param {Function} callback 
     */  
    getVideoThumbnailsByID:function(videoId,callback){
        this.getVideoItemByID(videoId,function(item){
           callback(item.snippet.thumbnails); 
        });
    },
    /** 
     * Get video description
     * 
     * @method getVideoDescriptionByID
     * @param {String} videoId
     * @param {Function} callback 
     */
    getVideoDescriptionByID:function(videoId,callback){
        this.getVideoItemByID(videoId,function(item){
           callback(item.snippet.description); 
        });
    },
    /** 
     * Get video published date
     * 
     * @method getVideoPublishedAtByID
     * @param {String}  videoId
     * @param {Function} callback 
     */
    getVideoPublishedAtByID:function(videoId,callback){
        this.getVideoItemByID(videoId,function(item){
           callback(item.snippet.publishedAt); 
        });        
    },
    /** 
     * Get channnel id video belong to
     * 
     * @method getVideoChannnelIdByID
     * @param {String} videoId
     * @param {Function} callback 
     */
    getVideoChannnelIdByID:function(videoId,callback){
        this.getVideoItemByID(videoId,function(item){
           callback(item.snippet.channelId); 
        });             
    },
    /** 
     * Get channel title video belong to
     * 
     * @method getVideoChannelTitleByID
     * @param {String} videoId
     * @param {Function} callback 
     */
    getVideoChannelTitleByID:function(videoId,callback){
        this.getVideoItemByID(videoId,function(item){
           callback(item.snippet.channelTitle); 
        });             
    },   
    /** 
     * Update video title
     * 
     * @method updateVideoTitle
     * @param {String} videoId
     * @param {String} title 
     * @param {Function} callback 
     */
    updateVideoTitle:function(videoId,title,callback){
        var t=this;
        //get video snip
        t.getVideoItemByID(videoId,function(item){
            if(item){
                //update title
                item.snippet.title=title;
                t.Update("videos?part=snippet",item,function(res){
                    if(callback) callback(res);
                });
            }
        });
    },
    /** 
     * Add tags to video
     * 
     * @method addTags
     * @param {String}  videoId
     * @param {String} tag space separated
     * @param {Function} callback 
     */
    addTags:function(videoId,tag,callback){
        var t=this;
        //get video snip
        t.getVideoItemByID(videoId,function(item){
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
    /** 
     * Replace tags of video
     * 
     * @method updateTags
     * @param {String} videoId
     * @param {String} tag tags replaced
     * @param {Function} callback 
     */ 
    updateTags:function(videoId,tag,callback){
        var t=this;
        //get video snip
        t.getVideoItemByID(videoId,function(item){
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
    /** Update video snippet
     * 
     * @method updateSnippet
    * @param {Object} item 
     * @param {Function} callback 
     */
    updateSnippet:function(item,callback){
        var t=this;

        t.Update("videos?part=snippet",item,function(res){
            if(callback) callback(res);
        });
         
    },
    /** 
     * Get video Item data
     * 
     * @method getVideoItemByID
    * @param {String} videoId
     * @param {Function} callback 
     */    
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
    /** 
     * Get accessToken
     * 
     * @method getAccessToken
     * @param {Function} callback 
     */    
    getAccessToken:function(){
        return this.authInfo?this.authInfo.access_token:false;
    },
    /** 
     * Get accessToken expire
     * 
     * @method getAccessTokenExpire
     * @param {Function} callback 
     */       
    getAccessTokenExpire:function(){
        return this.authInfo?this.authInfo.expires_at:false;
    },
    /** 
     * Get scopes
     * 
     * @method getScopes
     * @param {Function} callback 
     */     
    getScopes:function(){
        return this.authInfo?this.authInfo.scope.split(/\s/):false;
    },  
    /** 
     * Get clientId
     * 
     * @method getClientId
     * @param {Function} callback 
     */     
    getClientId:function(){
        return this.client_id;
    },
    /** 
     * Get clientSecret
     * 
     * @method getClientSecret
     * @param {Function} callback 
     */  
    getClientSecret:function(){
        return this.client_secret;
    },
    /** 
     * Get playlist created by your account
     * 
     * @method getMyPlayLists
     * @param {Function} callback 
     */ 
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
    /** 
     * Get playlist by playlist id
     * 
     * @method getPlayListsByID
     * @param {Function} callback 
     */ 
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
    /** 
     * Get vidoes on playlist
     * 
     * @method getPlayListItemByID
     * @param {Function} callback 
     */ 
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
                $.getScript("https://apis.google.com/js/client.js?onload=jtube"+current_time)
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
                  console.log(authResult);
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
    },
    /** 
     * Get rating of video
     * 
     * @method getVideoRating
     * @param {String} videoId
     * @param {Function} callback 
     */ 
    getVideoRating:function(videoId,callback){
        this.List("videos/getRating",{id:videoId},function(res){
            if(callback) callback(res);
        })
    },
    /** 
     * Get content detail of video
     * 
     * @method getVideoContentDetails
     * @param {String} videoId
     * @param {Function} callback 
     */ 
    getVideoContentDetails:function(videoId,callback){
        this.List("videos",{part:"contentDetails",id:videoId},function(res){
            if(res && res.items && res.items.length && callback) callback(res.items[0]);
        });
    },
    /** 
     * Get statistics(viewcount likecount dislikecount 
     * 
     * @method getVideoStatistics
     * @param {String} videoId
     * @param {Function} callback 
     */ 
    getVideoStatistics:function(videoId,callback){
        this.List("videos",{part:"statistics",id:videoId},function(res){
            if(res && res.items && res.items.length && callback) callback(res.items[0]);
        });        
    },
    /** 
     * Get view count of video
     * 
     * @method getVideoViewCount
     * @param {String} videoId
     * @param {Function} callback 
     */ 
    getVideoViewCount:function(videoId,callback){
        this.List("videos",{part:"statistics",id:videoId},function(res){
            if(res && res.items && res.items.length && res.items[0].statistics && callback) callback(res.items[0].statistics.viewCount);
        })            
    },
    /** 
     * Get like count of video
     * 
     * @method getVideoLikeCount
     * @param {String} videoId
     * @param {Function} callback 
     */ 
    getVideoLikeCount:function(videoId,callback){
        this.List("videos",{part:"statistics",id:videoId},function(res){
            if(res && res.items && res.items.length && res.items[0].statistics && callback) callback(res.items[0].statistics.likeCount);
        });         
    },
    /** 
     * Get dislike count of video
     * 
     * @method getVideoDisLikeCount
     * @param {String} videoId
     * @param {Function} callback 
     */ 
    getVideoDisLikeCount:function(videoId,callback){
        this.List("videos",{part:"statistics",id:videoId},function(res){
            if(res && res.items && res.items.length && res.items[0].statistics && callback) callback(res.items[0].statistics.dislikeCount);
        });        
    },
    /** 
     * Get favorite count of video
     * 
     * @method getVideoFavoriteCount
     * @param {String} videoId
     * @param {Function} callback 
     */ 
    getVideoFavoriteCount:function(videoId,callback){
        this.List("videos",{part:"statistics",id:videoId},function(res){
            if(res && res.items && res.items.length && res.items[0].statistics && callback) callback(res.items[0].statistics.favoriteCount);
        });         
    },
    /** 
     * Get comment count of video
     * 
     * @method getVideoCommentCount
     * @param {String} videoId
     * @param {Function} callback 
     */
    getVideoCommentCount:function(videoId,callback){
        this.List("videos",{part:"statistics",id:videoId},function(res){
            if(res && res.items && res.items.length && res.items[0].statistics && callback) callback(res.items[0].statistics.commentCount);
        });               
    },
    /** 
     * Get several data of video you want.
     * 
     * @method videosQuery
     * @param {Object} data
     * @param {Function} callback 
     */
    videosQuery:function(data,callback){
        this.List("videos",data,function(res){
            if(res && callback) callback(res);
        })
    }
    
}
