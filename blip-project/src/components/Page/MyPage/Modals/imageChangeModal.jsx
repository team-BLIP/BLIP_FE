import { useState, useRef } from "react";
import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";
import ESC from "../../../../svg/ESC.svg";

const ImageChangeModal = ({ message, onConfirm, onCancel, onImageSelect }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          textAlign: "left",
          width: "1110px",
          height: "740px",
          position: "relative",
        }}
      >
        <img
          src={ESC}
          alt="Close"
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "32px",
            right: "32px",
            cursor: "pointer",
          }}
        />
        <p
          style={{
            ...typography.Label2_46,
            color: color.GrayScale[8],
            marginLeft: "24px",
            marginTop: "32px",
            marginBottom: "8px",
          }}
        >
          {message}
        </p>

        <div
          style={{
            width: "1040px",
            height: "400px",
            backgroundColor: color.GrayScale[0],
            margin: "0 auto",
            marginTop: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            border: `1px solid ${color.GrayScale[2]}`,
            borderRadius: "8px",
          }}
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ ...typography.Body1, color: color.GrayScale[5] }}>
                프로필 이미지를 선택해주세요
              </p>
              <button
                style={{
                  backgroundColor: color.Main[3],
                  color: color.White,
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  marginTop: "16px",
                  cursor: "pointer",
                  ...typography.Button1,
                }}
                onClick={triggerFileInput}
              >
                이미지 선택하기
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: "none" }}
        />

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          {previewImage && (
            <button
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                border: `1px solid ${color.Main[4]}`,
                backgroundColor: color.White,
                color: color.Main[4],
                ...typography.Button1,
                cursor: "pointer",
              }}
              onClick={triggerFileInput}
            >
              다른 이미지 선택
            </button>
          )}

          <button
            style={{
              width: "107px",
              height: "48px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: previewImage
                ? color.Main[4]
                : color.GrayScale[3],
              color: color.White,
              ...typography.Button0,
              marginLeft: "auto",
              cursor: previewImage ? "pointer" : "not-allowed",
            }}
            onClick={onConfirm}
            disabled={!previewImage}
          >
            변경
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageChangeModal;
