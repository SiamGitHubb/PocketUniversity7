import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Button, Input, Card, Badge } from '../components/UI';
import { Camera, Hash, Briefcase, User, Save, Loader2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateUser } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        profileImage: currentUser.profileImage || ''
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Resize Image
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, profileImage: compressedBase64 }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUser(formData);
    setIsSaving(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
       <h1 className="text-2xl md:text-3xl font-bold text-brand-50 mb-6 md:mb-8 tracking-tight">My Profile</h1>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Profile Card / Image Upload */}
         <div className="lg:col-span-1 space-y-6">
            <Card className="flex flex-col items-center p-6 md:p-8 bg-brand-900/40 border-brand-800">
               <div className="relative group">
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-brand-700 bg-brand-950 overflow-hidden shadow-2xl flex items-center justify-center">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl md:text-5xl font-bold text-brand-600">{currentUser.initials}</span>
                    )}
                 </div>
                 <label className="absolute bottom-2 right-2 p-2 md:p-3 bg-brand-500 rounded-full cursor-pointer hover:bg-brand-400 transition-colors shadow-lg group-hover:scale-110 border-4 border-brand-900">
                    <Camera size={18} className="text-brand-950" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </label>
               </div>
               
               <h2 className="mt-6 text-xl md:text-2xl font-bold text-brand-100 text-center">{currentUser.name}</h2>
               <Badge color="brand" className="mt-2 text-sm px-3 py-1">{currentUser.role}</Badge>
               
               <div className="w-full mt-8 space-y-4 pt-6 border-t border-brand-800/50">
                  <div className="flex items-center text-sm text-brand-300 bg-brand-950/30 p-3 rounded-lg border border-brand-800/30">
                    <Hash size={18} className="mr-3 text-brand-500 shrink-0" />
                    <span className="font-mono tracking-wide truncate">{currentUser.id}</span>
                  </div>
                  <div className="flex items-center text-sm text-brand-300 bg-brand-950/30 p-3 rounded-lg border border-brand-800/30">
                    <Briefcase size={18} className="mr-3 text-brand-500 shrink-0" />
                    <span className="truncate">{currentUser.department} {currentUser.semester && `• Sem ${currentUser.semester}`} {currentUser.section && `• Sec ${currentUser.section}`}</span>
                  </div>
               </div>
            </Card>
         </div>

         {/* Edit Form */}
         <div className="lg:col-span-2">
           <Card className="bg-brand-900/40 border-brand-800 p-6 md:p-8">
             <div className="mb-6 flex items-center gap-2 text-brand-100 border-b border-brand-800/50 pb-4">
               <User size={20} className="text-brand-500" />
               <h3 className="text-lg font-bold">Personal Information</h3>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                  <Input 
                    label="Email Address" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
               </div>
               
               <Input 
                  label="Phone Number" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
               />

               <div className="space-y-2">
                 <label className="block text-xs font-semibold text-brand-300 ml-1">Bio</label>
                 <textarea 
                    className="w-full bg-brand-950/50 border border-brand-700/50 text-brand-50 rounded-lg px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-brand-700/70 hover:border-brand-600 resize-none h-32"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Write a short bio about yourself..."
                 />
               </div>

               <div className="flex justify-end pt-4">
                 <Button type="submit" className="w-full md:w-auto h-11 px-8" isLoading={isSaving}>
                   <Save size={18} className="mr-2" /> Save Changes
                 </Button>
               </div>
             </form>
           </Card>
         </div>
       </div>
    </div>
  );
};