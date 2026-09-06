!macro customHeader
  ; Menyiapkan variabel untuk opsi shortcut
  Var /GLOBAL CreateStartMenuShortcut
  Var /GLOBAL CreateDesktopShortcut
!macroend

!macro customInstall
  ; Shortcut Desktop & Start Menu dibuat otomatis dan didaftarkan ke Windows
  CreateDirectory "$SMPROGRAMS\JadwalPriok"
  CreateShortcut "$SMPROGRAMS\JadwalPriok\JadwalPriok.lnk" "$INSTDIR\JadwalPriok.exe" "" "$INSTDIR\JadwalPriok.exe" 0
  CreateShortcut "$DESKTOP\JadwalPriok.lnk" "$INSTDIR\JadwalPriok.exe" "" "$INSTDIR\JadwalPriok.exe" 0
!macroend

!macro customUnInstall
  ; Pembersihan shortcut bersih saat aplikasi di-uninstall
  Delete "$DESKTOP\JadwalPriok.lnk"
  Delete "$SMPROGRAMS\JadwalPriok\JadwalPriok.lnk"
  RMDir "$SMPROGRAMS\JadwalPriok"
!macroend