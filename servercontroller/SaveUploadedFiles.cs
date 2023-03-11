using System.Collections.Generic;
using System.Web.Http;
using Sytem.IO;

namespace MyWebApp.Controllers
{
	public class UploadedFile
    {
        public string fileName { get; set; }
        public string fileContents { get; set; }
        public int  Number { get; set; }
		public int  Sequence { get; set; }
    }

	public class UploadedResult
    {
        public string ServerFileName { get; set; }
        public string ReturnMessage { get; set; }
        public bool  Success { get; set; }
		public bool  Complete { get; set; }
    }
	
	public class fileUploader:ApiController
	{
		
		[HttpPost]
        public IHttpActionResult FileUploader(UploadedFile inputs)
        {
            string fileName = inputs.fileName;
			string fileContents = inputs.fileContents;
			
			int Number =1;
			if(inputs.Number)
				Number = inputs.Number;
			
			int Sequence =0;
			if(inputs.Sequence)
				Sequence = inputs.Sequence;
			
			string ServerFileName;
			string ReturnMessage;
			bool  Success;
			bool  Complete;
			
			saveUploadedFile(fileName,	fileContents, 	Number,	Sequence, out ServerFileName, out ReturnMessage, out Success, out Complete);
			
			UploadedResult outputs;
			
			outputs.ServerFileName = ServerFileName;
			outputs.ReturnMessage = ReturnMessage;
			outputs.Success = Success;
			outputs.Complete = Complete;
			
			return outputs
			
        }
		
		saveUploadedFile(string fileName,string fileContents,int Number = 1, int Sequence = 0, out string ServerFileName,out string ReturnMessage, out bool Success,  out bool Complete){
			try
			{
						   // string filePath;
				string filenametemp;
							
				if(fileName == "")
					filenametemp = "screenshot.png";
				else
					filenametemp = fileName;
				
				FileSequence =  Sequence;
				
				if(Number == 0 || Number == 1){
					
					ServerFileName = Guid.NewGuid() + filenametemp;
					filePath = UploadFolder + "" + ServerFileName;

							//using (var writer = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
							//{
					byte[] contents = Convert.FromBase64String(fileContents);
								
					System.IO.File.WriteAllBytes(filePath,contents);
							//}
					Success = true;
					ReturnMessage = "";
					Complete = true;
				}
				else{
					string filenametemp1;
					filenametemp1 = System.IO.Path.GetFileNameWithoutExtension(filenametemp);		
					ServerFileName = filenametemp;
					
					string filefolder =System.IO.Path.Combine(UploadFolder,filenametemp1);
					
					if (!System.IO.Directory.Exists(filefolder))
					{
						System.IO.Directory.CreateDirectory(filefolder);
					}
					filePath = System.IO.Path.Combine(filefolder,Sequence.ToString());
					
					byte[] contents = Convert.FromBase64String(fileContents);
								
					System.IO.File.WriteAllBytes(filePath,contents);
							//}

					System.IO.File.WriteAllText(System.IO.Path.Combine(filefolder,"complete"+Sequence.ToString()+".txt"), "complete");
					
					string[] files = System.IO.Directory.GetFiles(filefolder);
					
					if(files.Length == Number * 2){
						
						string[] txtfiles = System.IO.Directory.GetFiles(filefolder, "*.txt");

						foreach (string file in txtfiles)
						{
							System.IO.File.Delete(file);
						}
						
						var partFiles = System.IO.Directory.GetFiles(System.IO.Path.Combine(filefolder)).OrderBy(f => int.Parse(System.IO.Path.GetFileNameWithoutExtension(f)));
						
						ServerFileName = Guid.NewGuid() + filenametemp;
						filePath = System.IO.Path.Combine(UploadFolder, ServerFileName); //UploadFolder + "" + ServerFileName;
						
						using (var outputStream = System.IO.File.Create(filePath))
						{
							foreach (var partFile in partFiles)
							{
								using (var inputStream = System.IO.File.OpenRead(partFile))
								{
									inputStream.CopyTo(outputStream);
								}
							}
						} //using
						
						// Delete the temporary file parts
						foreach (var partFile in partFiles)
						{
							System.IO.File.Delete(partFile);
						}
						System.IO.Directory.Delete(filefolder);
						
						FileSequence = -1;
						
						Success = true;
						ReturnMessage = "All parts have been combined together!";
						
						Complete = true;
						
					} // if all parts has been uploaded
					else{
						Success = true;
						ReturnMessage = "";
					}
					
				}
					
							
			}
			catch (Exception e)
			{
							// TODO: Log exception and return "Server Error" message to user
						   // return new UploadFileOutput { Success = false, ResultMessage = e.ToString() }.ToJSON();
				Success = false;
				ReturnMessage = e.ToString();
			}   
		}
	}
}