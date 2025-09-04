const verEmailTemplate = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Florera - Kode OTP</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f5f9f6 0%, #e8f5e9 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 500px;
            width: 100%;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 15px 30px rgba(0, 82, 73, 0.1);
            overflow: hidden;
            padding: 40px;
            text-align: center;
        }
        
        .logo {
            margin-bottom: 25px;
        }
        
        .logo h1 {
            color: #27ae60;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .logo-icon {
            color: #27ae60;
            font-size: 32px;
        }
        
        .header {
            margin-bottom: 30px;
        }
        
        .header h2 {
            color: #2c3e50;
            font-size: 26px;
            margin-bottom: 15px;
        }
        
        .header p {
            color: #7f8c8d;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .otp-display {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            position: relative;
            border: 2px dashed #27ae60;
        }
        
        .otp-title {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .otp-code {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #27ae60;
            margin: 0 auto;
            width: fit-content;
            position: relative;
        }
        
        .countdown-container {
            margin: 25px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .countdown-title {
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .countdown {
            font-size: 24px;
            font-weight: 700;
            color: #27ae60;
            padding: 10px 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            display: inline-block;
            min-width: 100px;
            transition: all 0.3s;
        }
        
        .countdown.warning {
            color: #e67e22;
            animation: pulse 1s infinite;
        }
        
        .countdown.expired {
            color: #e74c3c;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .otp-copy {
            margin-top: 20px;
        }
        
        .btn-copy {
            padding: 12px 25px;
            background: #27ae60;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-copy:hover {
            background: #219653;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
        }
        
        .btn-copy:active {
            transform: translateY(0);
        }
        
        .btn-copy:disabled {
            background: #95a5a6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .info-box {
            background: #f9f9f9;
            border-radius: 15px;
            padding: 20px;
            margin-top: 30px;
            text-align: left;
        }
        
        .info-box h3 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .info-icon {
            color: #27ae60;
            font-size: 20px;
        }
        
        .info-box ul {
            list-style-type: none;
            padding-left: 10px;
        }
        
        .info-box li {
            color: #7f8c8d;
            margin-bottom: 10px;
            padding-left: 30px;
            position: relative;
            line-height: 1.5;
        }
        
        .info-box li:before {
            content: "•";
            color: #27ae60;
            font-weight: bold;
            position: absolute;
            left: 10px;
        }
        
        .footer {
            margin-top: 30px;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        @media (max-width: 576px) {
            .container {
                padding: 25px;
            }
            
            .logo h1 {
                font-size: 28px;
            }
            
            .header h2 {
                font-size: 22px;
            }
            
            .otp-code {
                font-size: 32px;
                letter-spacing: 5px;
                padding: 12px;
            }
            
            .countdown {
                font-size: 20px;
                padding: 8px 16px;
            }
        }
        
        .copy-notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #27ae60;
            color: white;
            padding: 12px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 1000;
        }
        
        .copy-notification.show {
            opacity: 1;
        }
        
        .expired-message {
            color: #e74c3c;
            font-weight: 600;
            margin-top: 15px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Kode OTP Anda</h2>
            <p>Gunakan kode berikut untuk verifikasi akun Florera Anda. Jangan bagikan kode ini kepada siapa pun.</p>
        </div>
        
        <div class="otp-display">
            <div class="otp-code">{otp}</div>
        </div>
        
        <div class="info-box">
            <h3><i class="fas fa-info-circle info-icon"></i> Informasi Penting</h3>
            <ul>
                <li>Kode OTP ini berlaku selama 1 menit</li>
                <li>Jangan bagikan kode ini dengan siapa pun, termasuk pihak yang mengaku dari Florera</li>
                <li>Segera masukkan kode ini pada halaman verifikasi</li>
                <li>Jika Anda tidak meminta kode ini, abaikan pesan ini</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>&copy; 2023 Florera. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`

export { verEmailTemplate };