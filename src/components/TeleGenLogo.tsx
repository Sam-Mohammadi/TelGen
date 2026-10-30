import React from 'react';

interface TeleGenLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  showBadge?: boolean;
  textClassName?: string;
  subtextClassName?: string;
  darkBackground?: boolean;
}

export const TeleGenLogo: React.FC<TeleGenLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  showBadge = false,
  textClassName = 'text-white text-lg font-black tracking-tight',
  subtextClassName = 'text-sky-300/90 text-xs font-medium',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 3D TELEGRAM PAPER AIRPLANE & TG MONOGRAM LOGO */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(56, 189, 248, 0.25))' }}
      >
        <defs>
          {/* Top Paper Plane - Upper Wing Gradient */}
          <linearGradient id="tgPlaneTopWing" x1="190" y1="90" x2="330" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="30%" stopColor="#3B82F6" />
            <stop offset="70%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>

          {/* Top Paper Plane - Underside / Folded Wing Gradient */}
          <linearGradient id="tgPlaneBottomWing" x1="220" y1="60" x2="285" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="35%" stopColor="#8B5CF6" />
            <stop offset="70%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#C026D3" />
          </linearGradient>

          {/* Top Paper Plane - Back Fuselage Crease Shadow */}
          <linearGradient id="tgPlaneCrease" x1="250" y1="70" x2="275" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="60%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#4A044E" />
          </linearGradient>

          {/* Upper Cyan/Blue Ribbon (T-bar & Left Curl) */}
          <linearGradient id="tgUpperRibbon" x1="240" y1="90" x2="50" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="25%" stopColor="#0ea5e9" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="80%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>

          {/* Upper Ribbon Highlight Sheen */}
          <linearGradient id="tgRibbonHighlight" x1="220" y1="100" x2="100" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </linearGradient>

          {/* Middle Ribbon - Amber/Golden to Magenta Gradient */}
          <linearGradient id="tgWarmRibbon" x1="280" y1="130" x2="150" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="20%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#F43F5E" />
            <stop offset="85%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>

          {/* Lower Loop (G Monogram Bowl) */}
          <linearGradient id="tgGBowl" x1="90" y1="260" x2="290" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="30%" stopColor="#3B82F6" />
            <stop offset="60%" stopColor="#7C3AED" />
            <stop offset="85%" stopColor="#C026D3" />
            <stop offset="100%" stopColor="#E879F9" />
          </linearGradient>

          {/* G Inner Bar & Spur */}
          <linearGradient id="tgGBar" x1="160" y1="300" x2="280" y2="255" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="40%" stopColor="#A855F7" />
            <stop offset="75%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>

          {/* Inner Swirl Accent (Cyan to Purple) */}
          <linearGradient id="tgInnerCrescent" x1="130" y1="280" x2="200" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          {/* Pulse Motion Pill Gradient */}
          <linearGradient id="tgMotionPill" x1="220" y1="225" x2="265" y2="225" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* ==================================================== */}
        {/* 1. UPPER BLUE/CYAN STREAMING RIBBON (Top of T)      */}
        {/* ==================================================== */}
        <path
          d="M232 98C222 112 204 135 178 152C146 173 114 180 84 186C60 191 42 201 44 218C46 235 63 248 82 247C105 246 118 230 134 214C156 192 188 181 216 168C228 162 238 152 243 140C249 125 246 109 232 98Z"
          fill="url(#tgUpperRibbon)"
        />

        {/* Upper Ribbon Edge Specular Sheen */}
        <path
          d="M232 98C215 118 190 142 160 160C128 178 95 186 68 194C55 198 46 205 45 214C45 210 50 200 66 193C96 181 130 171 162 153C192 135 218 112 232 98Z"
          fill="url(#tgRibbonHighlight)"
        />

        {/* Far Left Curl Hook */}
        <path
          d="M44 218C43 232 54 246 72 250C92 254 110 242 122 227C128 220 120 216 112 221C98 231 82 238 68 233C57 229 53 222 55 214C56 211 44 210 44 218Z"
          fill="#1E40AF"
        />

        {/* ==================================================== */}
        {/* 2. WARM ACCENT RIBBON (Golden-Yellow to Magenta)   */}
        {/* ==================================================== */}
        {/* Main warm flowing strand */}
        <path
          d="M276 136C265 152 240 174 210 190C178 207 148 217 126 235C118 242 110 252 115 264C120 274 133 277 144 272C165 262 185 244 207 230C233 214 262 198 277 172C284 160 286 146 276 136Z"
          fill="url(#tgWarmRibbon)"
        />

        {/* Upper golden tail feather extension */}
        <path
          d="M280 134C268 140 255 152 240 162C230 169 220 174 212 178C222 173 235 166 248 157C263 146 274 137 280 134Z"
          fill="#FDE047"
        />

        {/* Small golden dynamic flicker */}
        <path
          d="M260 162C245 174 228 184 214 192C226 186 242 177 258 166C264 162 268 158 270 156C268 158 264 160 260 162Z"
          fill="#FB923C"
        />

        {/* ==================================================== */}
        {/* 3. LOWER 'G' BOWL & INNER SPUR (G Monogram Loop)    */}
        {/* ==================================================== */}
        {/* Main circular bottom loop of G */}
        <path
          d="M126 235C108 252 98 275 102 301C108 335 136 364 171 376C212 389 256 376 284 345C304 322 308 290 292 264C281 247 262 242 244 246C231 249 224 262 232 272C240 281 254 285 263 294C273 305 268 325 256 336C236 354 203 361 176 350C148 339 129 313 129 283C129 264 137 248 148 236C153 230 144 220 136 226C132 229 129 232 126 235Z"
          fill="url(#tgGBowl)"
        />

        {/* Inner layered crescent swoosh inside G (adds glossy 3D depth) */}
        <path
          d="M148 278C140 296 142 318 154 332C170 348 194 353 216 348C200 348 182 342 170 330C158 318 155 300 160 284C162 276 150 270 148 278Z"
          fill="url(#tgInnerCrescent)"
        />

        {/* Horizontal shelf / inward spur of G */}
        <path
          d="M188 288C210 287 236 286 258 285C268 284 274 276 270 267C266 258 256 254 246 255C224 257 202 259 180 263C170 265 166 276 174 282C178 286 183 288 188 288Z"
          fill="url(#tgGBar)"
        />

        {/* Specular gloss streak on the G horizontal bar */}
        <path
          d="M185 267C205 264 227 262 248 260C256 259 261 262 263 265C258 261 248 260 238 261C218 263 198 265 178 268C174 269 177 268 185 267Z"
          fill="#FFFFFF"
          fillOpacity="0.6"
        />

        {/* ==================================================== */}
        {/* 4. SPEED CAPSULE & MOTION DOT (Right of G Shelf)    */}
        {/* ==================================================== */}
        <rect x="224" y="222" width="32" height="9" rx="4.5" fill="url(#tgMotionPill)" />
        <circle cx="272" cy="214" r="4.5" fill="#38BDF8" />
        <circle cx="288" cy="204" r="3" fill="#F43F5E" />

        {/* ==================================================== */}
        {/* 5. 3D ORIGAMI TELEGRAM PAPER AIRPLANE (Top Right)   */}
        {/* ==================================================== */}
        {/* Plane Drop Shadow / Glow beneath fuselage */}
        <path
          d="M216 152L262 132L290 144L245 166Z"
          fill="#312E81"
          fillOpacity="0.4"
          style={{ filter: 'blur(3px)' }}
        />

        {/* Main Left / Top Wing (Indigo to Electric Cyan) */}
        <path
          d="M328 32L188 102L262 134L328 32Z"
          fill="url(#tgPlaneTopWing)"
        />

        {/* Wing Top Specular Ridge */}
        <path
          d="M328 32L194 100L210 102L328 34Z"
          fill="#FFFFFF"
          fillOpacity="0.75"
        />

        {/* Center Crease / Fuselage Fold */}
        <path
          d="M328 32L262 134L250 162L328 32Z"
          fill="url(#tgPlaneCrease)"
        />

        {/* Right / Under Wing Flap (Purple to Vivid Magenta) */}
        <path
          d="M328 32L262 134L294 146L248 164L328 32Z"
          fill="url(#tgPlaneBottomWing)"
        />

        {/* Subtle highlight along the paper fold edge */}
        <line
          x1="327"
          y1="33"
          x2="262"
          y2="133"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.9"
          strokeLinecap="round"
        />
      </svg>

      {/* OPTIONAL BRAND TYPOGRAPHY */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={textClassName}>TeleGen</span>
            {showBadge && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-400 border border-sky-400/30">
                PRO v2.5
              </span>
            )}
          </div>
          <p className={subtextClassName}>تولید محتوا؛ سریع، خودکار، بینهایت</p>
        </div>
      )}
    </div>
  );
};
