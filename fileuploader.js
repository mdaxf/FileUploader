var FILE_UPLOADER = function(){
	var Context = this;
	this.ChunkSize = 2 * 1024 * 1024;
	this.url = "server/controller";
	this.Start_CallBack = null;
	this.Complete_CallBack = null;
	this.Initialize = function(UploadedURL, dropdiv ='', uploader='', screenshotpastdiv='',uploadpreviewdiv='', Start_CallBack, Complete_CallBack){
		
		if(UploadedURL !='')
			this.UploadedURL = UploadedURL;
		
		if(dropdiv !='')
			this.divDropFile =$(dropdiv);
			
		if(uploader !='')
			this.fileUploader = $(uploader);
		
		if(screenshotpastdiv !='')
			this.pasterdiv = $(screenshotpastdiv);
		
		if(uploadpreviewdiv !='')
			this.previewdiv = $(uploadpreviewdiv)
		
		FILE_UPLOADER.Context = this;
			
		
		if(Start_CallBack !=null)
			this.Start_CallBack = Start_CallBack;
		
		if(Complete_CallBack !=null)
			this.Complete_CallBack = Complete_CallBack;		
		
		this.Initialize_events();
	}
	
	this.destroy = function(){
		if(this.divDropFile){
			this.divDropFile.off("dragenter", this.handleDragover);
		    this.divDropFile.off("dragover", this.handleDragover);
		    this.divDropFile.off("drop", this.handleDrop);
		}

		if(this.fileUploader)
			this.fileUploader.off('change', event => {
		  this.handleImageUpload(event)});

		if(this.pasterdiv )
			document.removeEventListener('paste', event => {
				this.handlepastedscreenshot(event);
			});		
	
	}	
	
	this.Initialize_events = function(){
	
		if(this.divDropFile){
			this.divDropFile.on("dragenter", event => {this.handleDragover(event)});
		    this.divDropFile.on("dragover", event =>{this.handleDragover(event)});
		    this.divDropFile.on("drop", event =>{this.handleDrop(event)});
		}

		if(this.fileUploader){
			this.fileUploader.attr('type','file');
			this.fileUploader.on('change', event => {
		  this.handleImageUpload(event)});
		}
		if(this.pasterdiv )
			document.addEventListener('paste', event => {
				FILE_UPLOADER.Context.handlepastedscreenshot(event);
			});	
			
		console.log(this.divDropFile,this.fileUploader)
	}
	
	this.handlepastedscreenshot = function(event){
	  console.log(event)
	  var isChrome = false;
	  if ( event.clipboardData || event.originalEvent ) {
	    //Some versions of chrome not for ie11 use event.originalEvent
	    var clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
	    if ( clipboardData.items ) {
	      // for chrome
	      var  items = clipboardData.items,
	        len = items.length,
	        blob = null;
	      isChrome = true;

		  event.preventDefault();

	      //Look for the pasted image in items. According to the analysis above, you need to loop  
	      for (var i = 0; i < len; i++) {
	        if (items[i].type.indexOf("image") !== -1) {

			  //getAsFile() This method is only supported by living standard firefox ie11.        
	          blob = items[i].getAsFile();
	        }
	      }
	      if ( blob !== null ) {
	        var reader = new FileReader();
	        reader.onload = function (event) {
	          // event.target.result is the Base64 encoding string of the picture.
	          var base64_str = event.target.result
	          //You can write upload logic here to upload base64 encoding strings directly (you can try to pass in a blob object to see if the background program can parse)
	          FILE_UPLOADER.Context.uploadImgFromPaste(base64_str, 'paste', isChrome);
	        }
	        reader.readAsDataURL(blob); 
	      }
	    } else {
	      //for firefox
	      setTimeout(function () {
	        //The reason for setting Timeout is to ensure that the image is inserted into the div first and then the value is obtained.
	        var imgList = document.querySelectorAll('#tar_box img'),
	          len = imgList.length,
	          src_str = '',
	          i;
	        for ( i = 0; i < len; i ++ ) {
	          if ( imgList[i].className !== 'my_img' ) {
	            //If it's a screenshot, src_str is base64. If it's a copy of another web page image, src_str is the address of the image on another server.
	            src_str = imgList[i].src;
	          }
	        }
	        FILE_UPLOADER.Context.uploadImgFromPaste(src_str, 'paste', isChrome);
	      }, 1);
	    }
	  } else {
	    //for ie11
	    setTimeout(function () {
	      var imgList = document.querySelectorAll('#tar_box img'),
	        len = imgList.length,
	        src_str = '',
	        i;
	      for ( i = 0; i < len; i ++ ) {
	        if ( imgList[i].className !== 'my_img' ) {
	          src_str = imgList[i].src;
	        }
	      }
	     FILE_UPLOADER.Context.uploadImgFromPaste(src_str, 'paste', isChrome);
	    }, 1);
	  }
	}

	this.uploadImgFromPaste = function(file, type, isChrome){

		    var url =  FILE_UPLOADER.Context.url; 

			var inputs = {};
			  
			inputs.FileName = (file.name ==="undefined")?"screenshot.png":file.name;
			inputs.Contents =   file
				.replace("data:", "")
	        	.replace(/^.+,/, "");
			
		  	console.log(inputs)
		
			var data = {
				"inputs": inputs
			}
		
			var settings = {
			  "url": url,
			  "method": "POST",
			  "timeout": 0,
			  "headers": {
			    "Content-Type": "application/json"
			  },
			  "data": JSON.stringify({"inputs": inputs}),
			};

			console.log(settings);
			
			$.ajax(settings).done(function (response) {
			  console.log(response);
			  
			  if(response.Outputs.Success){
			  		var str = FILE_UPLOADER.Context.UploadedURL + response.Outputs.ServerFileName;
					str = '<a target="_blank" href="' + str+'">'+ response.Outputs.ServerFileName  + '</a><br/>'
					
					if (typeof FILE_UPLOADER.Context.Complete_CallBack == "function")
						FILE_UPLOADER.Context.Complete_CallBack(response.Outputs.ServerFileName);
									
					if(this.previewdiv)
						FILE_UPLOADER.Context.previewdiv.append(str)
				
				}
			  
			  
			});		
		
		
	}


	this.handleDrop = function(e)
	{
		if (typeof FILE_UPLOADER.Context.Start_CallBack == "function")
	  		FILE_UPLOADER.Context.Start_CallBack(e);
			
	    e.stopPropagation();
	    e.preventDefault();
	    
	    var files = e.originalEvent.dataTransfer.files;
	    var f = files[0];
		
		FILE_UPLOADER.Context.ConvertContenttoBase64(files[0]);
		
	}


	this.handleDragover = function(e)
	{
	    e.stopPropagation();
	    e.preventDefault();
	    e.originalEvent.dataTransfer.dropEffect = 'copy';
	}


	this.ConvertContenttoBase64 = function(file) {
	   var reader = new FileReader();
	   reader.readAsDataURL(file);
	   reader.onload = function () {
	   
		    var url = FILE_UPLOADER.Context.url;
			
			var chunkSize =  FILE_UPLOADER.Context.ChunkSize; //1024*1024*1;
			var chunks = [];
			var start = 0;
			var end = 0
			console.log(file.size, chunkSize)
			while(start < file.size){
				end = Math.min(start + chunkSize, file.size);
			    var chunk = file.slice(start, end);
			    chunks.push(chunk);
			    start = end;			
			}
			
			console.log(chunks)
			var Sequence=0; 
			var Number = chunks.length;

		   const chunkPromises = chunks.map(chunk => {
		    return new Promise(resolve => {
		      const reader = new FileReader();
		      reader.onload = () => {
		        resolve(reader.result)
		      };
		      reader.readAsDataURL(chunk);
		    });
		   });			
			
			Promise.all(chunkPromises).then(chunkDataUrls => {
			
				const jsonObjects = chunkDataUrls.map((dataUrl, index) => {
			      return {
			        FileName: file.name,
			    //    filesize: file.size,
			        Sequence: index,
					Number: Number,
			        Contents: dataUrl.split(',')[1]
								.replace("data:", "")
			        			.replace(/^.+,/, ""), // extract base64-encoded data from data URL
			      };
			    });
				
				jsonObjects.forEach(async(jsonObject) =>{

					var index = jsonObject.Sequence;
					var settings = {
					  "url": url,
					  "method": "POST",
					  "timeout": 0,
					  "headers": {
					    "Content-Type": "application/json"
					  },
					  "data": JSON.stringify({"inputs": jsonObject}),
					};
				//	console.log(settings);
				//	console.log(jsonObject.Contents)
					$.ajax(settings).done(function (response) {
					//  console.log(response);
					  
					  if(response.Outputs.Success){
					  		if(response.Outputs.Complete){
						  		var str = FILE_UPLOADER.Context.UploadedURL + response.Outputs.ServerFileName;
								str = '<a href="' + str+'">'+ response.Outputs.ServerFileName  + '</a><br/>'	
								
								if (typeof FILE_UPLOADER.Context.Complete_CallBack == "function")
										FILE_UPLOADER.Context.Complete_CallBack(response.Outputs.ServerFileName);
								
								if(this.previewdiv)
									FILE_UPLOADER.Context.previewdiv.append(str);					
							}
						}
					  
					  
					});	
				});
			
			})
	   };
	   reader.onerror = function (error) {
	     console.log('Error: ', error);
	   };
	}


	this.handleImageUpload = function(event) {
	  
	  if (typeof FILE_UPLOADER.Context.Start_CallBack == "function")
	  	FILE_UPLOADER.Context.Start_CallBack(event);
		
	  var files = event.target.files
	  const formData = new FormData()
	  formData.append('myFile', files[0])

	  FILE_UPLOADER.Context.ConvertContenttoBase64(files[0]);
	  
	}

}
