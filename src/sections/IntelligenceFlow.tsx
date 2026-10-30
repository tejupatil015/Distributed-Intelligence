import { useRef, useState } from "react";
import {
  gsap,
  useGSAP,
  isReducedMotion,
} from "../hooks/useMediaPreferences";
import Tesseract from "tesseract.js";
import { Img } from "../components/ui";
import { images } from "../data/images";
import "../utils/IntelligenceFlow.css";

export function IntelligenceFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (isReducedMotion()) {
      gsap.set(
        ".intelligence-reveal, .intelligence-card-reveal, .intelligence-image-reveal",
        {
        autoAlpha: 1,
        clearProps: "transform,filter",
        }
      );
      return;
    }

    const entrance = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
    });

    entrance
      .fromTo(
        ".intelligence-reveal",
        { autoAlpha: 0, y: 42, filter: "blur(8px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power4.out",
        }
      )
      .fromTo(
        ".intelligence-image-reveal",
        { autoAlpha: 0, x: 40, scale: 0.94, clipPath: "inset(0 0 0 12%)" },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          clipPath: "inset(0 0 0 0%)",
          duration: 1,
          ease: "power3.out",
        },
        "-=0.72"
      )
      .fromTo(
        ".ocr-upload",
        { autoAlpha: 0, x: -58, y: 28, rotate: -2, scale: 0.96 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1.05,
          ease: "power3.out",
        },
        "-=0.35"
      )
      .fromTo(
        ".ocr-result",
        { autoAlpha: 0, x: 58, y: 38, rotate: 2, scale: 0.96 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
        },
        "-=0.78"
      );
  }, { scope: sectionRef });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      setSelectedFile(null);
      setExtractedText("");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setSelectedFile(null);
      setExtractedText("");
      return;
    }

    setSelectedFile(file);
    setExtractedText("");
    setError("");
    setProgress(0);
  };

  const handleExtractText = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setExtractedText("");
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        selectedFile,
        "eng",
        {
          logger: (message) => {
            if (
              message.status === "recognizing text" &&
              typeof message.progress === "number"
            ) {
              setProgress(Math.round(message.progress * 100));
            }
          },
        }
      );

      const text = result.data.text.trim();

      if (!text) {
        setError(
          "No text was detected. Try a clearer image with readable text."
        );
      } else {
        setExtractedText(text);
        setProgress(100);
      }
    } catch {
      setError(
        "Text extraction failed. Please try another image."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = async () => {
    if (!extractedText) return;

    try {
      await navigator.clipboard.writeText(extractedText);
    } catch {
      setError("Unable to copy text. Please copy it manually.");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedText("");
    setIsProcessing(false);
    setProgress(0);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section
      className="intelligence-section"
      ref={sectionRef}
    >
      <div className="intelligence-intro">
        <div className="intelligence-heading intelligence-reveal">
          <span>INTELLIGENCE FLOW</span>

          <h2>
            Turn documents into{" "}
            <span>intelligence.</span>
          </h2>

          <p>
            Transform document images into readable digital text with
            intelligent OCR processing. Upload an image, extract its
            contents, and prepare your document data for further
            analysis.
          </p>
        </div>

        <figure className="intelligence-feature-image intelligence-image-reveal">
          <Img
            src={images.automatedIntelligence}
            alt="A person working with digital technology on a laptop"
          />
          <figcaption>
            <span>FROM IMAGE TO INSIGHT</span>
            <strong>Every detail, ready to be understood.</strong>
          </figcaption>
        </figure>
      </div>

      <div className="intelligence-workspace">
        {/* Upload section */}
        <div className="ocr-upload intelligence-card-reveal">
          <div className="ocr-icon" aria-hidden="true">
            ⇧
          </div>

          <h3>Upload your document</h3>

          <p>
            Select a clear image containing printed text to begin
            extraction.
          </p>

          <span>Supported formats: JPG, PNG, WEBP · Max 10 MB</span>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            aria-label="Choose document image"
            disabled={isProcessing}
          />

          {selectedFile && (
            <p className="ocr-file-name">
              Selected: {selectedFile.name}
            </p>
          )}

          <button
            type="button"
            className="ocr-action-button"
            onClick={handleExtractText}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing
              ? `Extracting... ${progress}%`
              : "Extract Text"}
            <span aria-hidden="true"> ↗</span>
          </button>

          {isProcessing && (
            <div
              className="ocr-progress-track"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="ocr-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* OCR result section */}
        <div className="ocr-result intelligence-card-reveal">
          <div className="ocr-result-header">
            <div>
              <small>DOCUMENT ANALYSIS</small>
              <h3>Extraction results</h3>
            </div>

            <span className="ocr-result-badge">
              {isProcessing
                ? "PROCESSING"
                : extractedText
                  ? "COMPLETED"
                  : "READY"}
            </span>
          </div>

          {isProcessing ? (
            <div className="ocr-empty-state">
              <div className="ocr-loading-icon">✳</div>
              <h4>Reading your document...</h4>
              <p>
                OCR is identifying text in your image. This may take
                a little time.
              </p>
            </div>
          ) : extractedText ? (
            <>
              <div className="ocr-text-output">
                <p>{extractedText}</p>
              </div>

              <div className="ocr-result-actions">
                <button
                  type="button"
                  className="ocr-action-button"
                  onClick={handleCopyText}
                >
                  Copy extracted text
                </button>

                <button
                  type="button"
                  className="ocr-reset-button"
                  onClick={handleReset}
                >
                  Start again
                </button>
              </div>

              <small>
                {extractedText.split(/\s+/).filter(Boolean).length}{" "}
                words detected
              </small>
            </>
          ) : (
            <div className="ocr-empty-state">
              <div className="ocr-empty-icon">▤</div>
              <h4>Your extracted text will appear here</h4>
              <p>
                Upload a document image and select Extract Text to
                view the OCR output.
              </p>
            </div>
          )}

          {error && (
            <p className="ocr-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div className="intelligence-features intelligence-reveal">
        <span>✦ Image-to-text conversion</span>
        <span>⌁ Automated text recognition</span>
        <span>▤ Digital document processing</span>
        <span>↗ Ready for data analysis</span>
      </div>
    </section>
  );
}