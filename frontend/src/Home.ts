import * as fr from './framework';

export default function Home() {
  return (
      fr.div({ class: "mx-auto" },
        fr.div({ class: "border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
          fr.div({ class: "flex items-center gap-2 border-b border-green-500/30 pb-2 mb-4" },
            fr.div({ class: "h-3 w-3 rounded-full bg-green-500" }),
            fr.p({ class: "text-xs" }, "terminal@user:~")
          ),

          fr.div({ class: "space-y-4" },
            // fr.p({ class: "text-green-400" },
            //   text,
            //   showCursor ? "█" : " "
            // ),

            fr.div({ class: "mt-8" },
              fr.p({ class: "text-green-300 opacity-80" }, "$ system.info"),
              fr.pre({ class: "mt-2 text-sm" }, 
                `OS: Terminal_OS v1.0.2
KERNEL: RetroKernel 4.8.15
UPTIME: 3d 7h 14m 32s
MEMORY: 640K (should be enough for anybody)
STATUS: All systems operational`
              )
            ),

            fr.div({ class: "mt-4" },
              fr.p({ class: "text-green-300 opacity-80" }, "$ ls -la /projects"),
              fr.pre({ class: "mt-2 text-sm" }, 
                `drwxr-xr-x  2 user terminal  4096 Mar 14 16:22 .
drwxr-xr-x 21 user terminal  4096 Mar 14 16:22 ..
-rw-r--r--  1 user terminal 12680 Mar 14 16:22 project_alpha.exe
-rw-r--r--  1 user terminal  8452 Mar 14 16:22 neural_net.dat
-rw-r--r--  1 user terminal  2048 Mar 14 16:22 quantum_algo.bin`
              )
            ),

            fr.div({ class: "mt-4 flex items-center" },
              fr.span({ class: "text-green-400 mr-2" }, "$"),
              fr.div({ class: "h-5 w-2 bg-green-500 animate-pulse" })
            )
          )
        ),

        fr.div({ class: "mt-8 text-green-400/70 text-sm text-center" },
          fr.p(`© ${new Date().getFullYear()} TERM_OS • All systems nominal`)
        )
      )
    )
}
