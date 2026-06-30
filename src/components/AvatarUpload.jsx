import { useRef } from "react";
import { Camera, Upload, X } from "lucide-react";

export default function AvatarUpload({ currentAvatar, onAvatarUpdate, size = "large" }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        onAvatarUpdate(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32"
  };

  const iconSizes = {
    small: 20,
    medium: 28,
    large: 36
  };

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          rounded-full
          bg-gradient-to-br from-cyan-400 to-blue-500
          flex items-center justify-center
          cursor-pointer
          overflow-hidden
          relative
          group
          hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]
          transition-all
          duration-300
        `}
      >
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white font-bold text-2xl">
            {size === "small" ? "?" : "?"}
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera size={iconSizes[size]} className="text-white" />
        </div>
      </div>

      {/* Change avatar button below */}
      <button
        onClick={handleClick}
        className="mt-3 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition text-sm"
      >
        <Upload size={16} />
        <span>Change Avatar</span>
      </button>

      {currentAvatar && (
        <button
          onClick={() => onAvatarUpdate(null)}
          className="ml-2 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
          title="Remove avatar"
        >
          <X size={16} />
        </button>
      )}

      <p className="text-xs text-slate-400 mt-2">
        JPG, GIF or PNG. Max size 2MB
      </p>
    </div>
  );
}