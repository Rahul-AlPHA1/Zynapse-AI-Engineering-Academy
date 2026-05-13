!include LogicLib.nsh
!include nsDialogs.nsh

!ifndef BUILD_UNINSTALLER

!macro customPageAfterChangeDir
  Page custom ZynapseModePageCreate ZynapseModePageLeave
!macroend

Function ZynapseModePageCreate
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 24u "Choose how Zynapse should be configured after installation."
  Pop $0

  ${NSD_CreateRadioButton} 0 38u 100% 24u "Use AI Providers - I will add Groq, Gemini, OpenAI, Claude, or other API keys."
  Pop $R1

  ${NSD_CreateRadioButton} 0 72u 100% 32u "Use Local Ollama - no API key. Zynapse will verify this PC on first launch and recommend a fast small model."
  Pop $R2

  ${NSD_CreateLabel} 0 116u 100% 36u "Note: local model downloads can be large, so Zynapse starts them on first launch after checking that Ollama is installed and running."
  Pop $0

  ${NSD_Check} $R1
  StrCpy $R0 "ai-providers"
  nsDialogs::Show
FunctionEnd

Function ZynapseModePageLeave
  ${NSD_GetState} $R2 $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $R0 "local-ollama"
  ${Else}
    StrCpy $R0 "ai-providers"
  ${EndIf}
FunctionEnd

!endif

!macro customInstall
  ${If} $R0 == ""
    StrCpy $R0 "ai-providers"
  ${EndIf}
  CreateDirectory "$APPDATA\Zynapse"
  FileOpen $0 "$APPDATA\Zynapse\install-choice.json" w
  FileWrite $0 '{"mode":"$R0"}'
  FileClose $0
!macroend
